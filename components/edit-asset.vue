<template>
  <v-dialog v-model="isVisible" persistent v-if="isAssetSelected" >
    <v-card v-if="asset">
      <v-card-text>
        <div class="field-row" >
          <div >
            <v-text-field v-model="asset.id" 
              outlined
              :label="`ID`"
              :hint="asset.guid"
              @blur="onBlurTitle()"
                />
          </div>
          <div>
            <v-text-field v-model="asset.type" 
              outlined
              :label="`Type`"
              />
          </div>
          <div>
            <v-text-field v-model="asset.name" 
              outlined
              :label="`Name`"
              />
          </div>
        </div><!--field-row-->
        <div class="field-row" v-if="asset.type==='crop'" >
          <div>
            <v-autocomplete
              v-model="asset.plant"
              label="Plant"
              outlined
              :items="typeList('plant')"
              :loading="false"
              color="white"
              :rules="[rules.plant]"
              item-text="name"
              item-value="id"
              placeholder="Start typing to Search"
            ></v-autocomplete>
          </div>
          <div><v-text-field v-model="asset.variety" 
            outlined
            label="Variety"
            /></div>
        </div><!--field-row-->
        <v-data-table 
          class="elevation-1"
          disable-pagination hide-default-header hide-default-footer
          no-data-text="Tag your asset with dated notes"
          :headers="tagHeaders"
          :items="tagList" :items-per-page="7"
          >
          <template v-slot:item.name="{ item }">
            {{ item.applies 
              ? `\u2713\u00a0${item.name}` 
              : `\u231B\u00a0${item.name}` 
            }}
          </template>
          <template v-slot:item.date="{ item }">
            {{ tagDate(item) }}
          </template>
          <template v-slot:item.note="{ item }">
            {{ noteSummary(item)}}
          </template>
          <template v-slot:top>
            <v-toolbar flat color="white">
              <v-spacer></v-spacer>
              <v-dialog v-model="tagDialog" 
                max-width="500px">
                <template v-slot:activator="{ on }">
                  <v-btn color="green darken-2" icon class="mb-2" 
                    title="Add Tag"
                    v-on="on"><v-icon>mdi-tag-plus</v-icon></v-btn>
                </template>
                <v-card>
                  <v-card-title>
                    <span class="headline">Edit Tag</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col>
                          <v-text-field v-model="tagModel.name" 
                            :hint="nameHint"
                            label="Tag name"></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                          <v-radio-group v-model="tagModel.applies" 
                            row>
                            <v-radio :label="`\u2713 Actual `" 
                              :value="true"/>
                            <v-radio :label="`\u231B Planned`" 
                              :value="false"/>
                          </v-radio-group>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <date-field hint="Date" 
                              :item="tagModel" model="date"/>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-textarea v-model="tagModel.note"
                          outlined clearable
                          label="Notes"
                        ></v-textarea>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-2" text @click="closeTag"
                      >Cancel</v-btn>
                    <v-btn color="green darken-2" text @click="saveTag"
                      :disabled="!tagModel.name"
                      >Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editTag(item)"
              title="Edit Tag">
              mdi-pencil </v-icon>
            <v-icon small @click="deleteTag(item)" 
              title="Delete Tag">
              mdi-delete </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="green darken-2" icon class="mb-2" 
          @click="closeAsset"
          ><v-icon>mdi-close</v-icon></v-btn>
        <v-spacer/>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import Vue from "vue";
  import DateField from "./date-field";
  import Asset from "../src/asset.js";
  import Tag from "../src/tag.js";

  export default {
    name: "EditAsset",
    data: ()=>{ 
      var tagDefault = new Tag({
        applies: true,
      });
      return {
        asset: null,
        editedTag: null,
        tagDialog: false,
        tagModel: new Tag(tagDefault),
        tagDefault, 
        tagPerPage: 3,
        tagList: [],
        tagHeaders: [{
          text: "Days",
          value: "date",
        },{
          text: "Name",
          value: "name",
        },{
          text: "Note",
          value: "note",
        },{
          text: "Actions",
          value: "actions",
        }],
        rules: {
          plant: v => { console.log(`rules.plant ${v}`); return !!v},
        },
    }},
    methods: {
      onBlurTitle() {
        var asset = this.asset;
        if (!asset.id) {
          Vue.set(asset,"id", this.title);
        }
      },
      changeStarted() {
        var asset = this.asset;
        var started = asset.started;
        if (started) {
          asset.startDate = new Date();
        }
      },
      deleteTag(tag) {
        var asset = this.asset;
        var msg = `Delete "${tag.name}" tag `+
          `from ${asset.type} ${asset.id}?`;
        if (confirm(msg)) {
          console.log(`deleteTag`, tag.name);
          asset.deleteTag(tag);
          this.tagList = asset.tagList.slice();
        }
      },
      editTag(tag) {
        console.log(`editTag`, tag);
        Object.assign(this.tagModel, tag);
        this.editedTag = tag;
        this.tagDialog = true;
      },
      saveTag () {
        console.log('Tag save')
        if (this.editedTag) {
          if (this.tagModel.date > new Date() && this.tagModel.applies) {
            let msg = `Set future tag status to 'Planned'?`;
            if (!confirm(msg)) {
              return;
            }
            this.tagModel.applies = false;
          }
          Object.assign(this.editedTag, this.tagModel);
        } else {
          var asset = this.asset;
          asset.addTag(this.tagModel);
          this.tagList = asset.tagList.slice();
          this.tagModel = Object.assign({}, this.tagDefault);
          this.tagModel.date = new Date();
        }
        this.editedTag = null;
        this.tagDialog = false;
      },
      closeTag () {
        console.log('Tag close')
        this.$nextTick(()=>{
          this.tagModel = new Tag({
            name: "",
            applies: true,
          });
          this.editedTag = null;
          this.tagDialog = false;
        });
      },
      tagDate(tag) {
        var date = tag.date;
        var msDays = 24 * 60 * 60 * 1000;
        var days = Math.round((new Date() - date)/msDays);
        return `${days}`;
      },
      closeAsset() {
        console.log(`closeAsset()`);
        this.$store.commit('assets/updateAsset', this.asset);
        this.$store.commit('select', null);
        this.$router.go(-1);
      },
      noteSummary(tag) {
        var maxNote = 20;
        return tag && tag.note && tag.note.length > maxNote
          ? tag.note.substring(0, maxNote) + '...'
          : tag.note;
      },
      typeList(type) {
        var values = this.assetStore.assetsOfType(type);
        return values;
      },
    },
    computed: {
      isAssetSelected() {
        return !!this.$store.state.selection;
      },
      xasset() {
        return this.$store.state.selection;
      },
      assetStore() {
        return this.$store.state.assets.assetStore;
      },
      plantItems() {
        var plants = this.assetStore.assetsOfType("plant");
        return plants;
      },
      nameHint() {
        var {
          tagModel,
        } = this;
        var name = tagModel.name;
        var asset = this.assetStore.assetOfId(name);
        var hint = asset && asset.name || 
          name || 
          "Enter tag name or asset id";
        return hint;
      },
      title() {
        return this.asset.id;
      },
      isVisible: {
        get: function() {
          return !!this.asset
        },
        set: function() { 
          this.$store.commit('select', null);
        },
      },
    },
    mounted() {
      var asset = this.$store.state.selection;
      console.log(`edit-asset.mounted() `, asset);
      if (asset) {
        this.asset = new Asset(asset);
        this.tagList = this.asset.tagList;
      }
    },
    components: {
      DateField,
    }
  }
</script>
<style>
.itemInfo {
  padding:0;
  margin: 0;
  line-height: 1em;
}
.gr-history {
    font-weight: 500;
}
.history-row{
    display: flex;
    flex-flow: row wrap;
    margin: 0;
    padding: 0;
    line-height: 1rem;
    border-bottom: 1pt solid #eee;
}
.history-row-item{
    margin: 0.2em;
    margin-right: 1em;
}
.field-row {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  padding-top: 1.3em;
}
.field-row:first-of-type {
  border-bottom: 1pt solid #eee;
  padding-bottom: 0em;
}
.field-row > div {
  width: 20em;
  min-width: 15em;
}
.tag-name {
  display: inline-block;
}
</style>
