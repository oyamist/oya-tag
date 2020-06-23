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
            <asset-picker propName="plant" :asset="asset"/>
          </div>
        </div><!--field-row-->
        <v-data-table 
          class="elevation-1"
          disable-pagination hide-default-header hide-default-footer
          no-data-text="Tag your asset with dated notes"
          :headers="tagHeaders"
          :items="tagList" 
          :items-per-page="-1"
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
            <a :href="item.noteUrl" v-if="item.noteUrl"
              target="_blank">
              {{ noteSummary(item)}}
            </a>
            <span v-if="!item.noteUrl">
              {{noteSummary(item)}}
            </span>
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
                  <v-card-text>
                    <v-container>
                      <v-row>
                        <v-col>
                          <v-text-field v-model="tagModel.name" 
                            outlined
                            :hint="nameHint"
                            label="Tag name"></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <date-field hint="Date" 
                            :item="tagModel" model="date"/>
                          <v-alert v-if="!isTagDateValid" type="error">
                            Tags with future dates must be Planned, 
                            not Active
                          </v-alert>
                        </v-col>
                        <v-col>
                          <v-checkbox v-model="tagModel.applies"
                            label="Done">
                          </v-checkbox>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col>
                          <v-textarea v-model="tagModel.note"
                            outlined clearable
                            label="Notes"
                          ></v-textarea>
                        </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <v-btn text class="mr-5"
                      @click="deleteTag()"
                      >Delete
                    </v-btn>
                    <v-btn text @click="closeTag"
                      >{{tagChanged ? "Cancel" : "Close"}}
                    </v-btn>
                    <v-spacer></v-spacer>
                    &nbsp;
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-2 white--text" raised
                      @click="saveTag"
                      :disabled="!isTagValid || !tagChanged"
                      >Save
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editTag(item)"
              title="Edit Tag">
              mdi-pencil </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
      <v-card-actions>
        <v-btn text class="mb-2 mr-5" 
          @click="deleteAsset"
          >Delete
        </v-btn>
        <v-btn text class="mb-2" 
          @click="cancelAsset"
          title="Close/Cancel"
          >
            {{assetChanged ? "Cancel" : "Close"}}
        </v-btn>
        <v-spacer/>
        &nbsp;
        <v-spacer/>
        <v-btn color="green darken-2 white--text" 
          raised class="mb-2" 
          @click="closeAsset"
          title="Save Asset"
          :disabled="!assetChanged"
          >Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import Vue from "vue";
  import { MerkleJson } from "merkle-json";
  import DateField from "./date-field";
  import AssetPicker from "./asset-picker";
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
        mj: new MerkleJson(),
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
      deleteAsset() {
        var {
          id,
          name,
        } = this.asset;
        if (confirm(`Delete asset ${id}/${name} forever?`)) {
          this.$store.commit(`assets/remove`, id);
          this.$store.commit(`select`, null);
          this.editedTag = null;
          this.tagDialog = false;
          this.$router.go(-1);
        }
      },
      deleteTag(tag) {
        var asset = this.asset;
        tag = tag || this.editedTag;
        if (tag) {
          if (this.editedTag) {
            this.closeTag();
          }
          var msg = `Delete "${tag.name}" tag `+
            `from ${asset.type} ${asset.id}?`;
          if (confirm(msg)) {
            console.log(`deleteTag`, tag.name);
            asset.deleteTag(tag);
            this.tagList = asset.tagList.slice();
          }
        }
      },
      editTag(tag) {
        console.log(`editTag`, tag);
        Object.assign(this.tagModel, tag);
        this.editedTag = tag;
        this.tagDialog = true;
      },
      saveTag () {
        console.log('saveTag')
        var {
          tagModel,
          $store,
        } = this;
        var now = new Date();
        if (this.editedTag) {
          var dateDiff = now - tagModel.date;
          if (dateDiff < 0 && this.tagModel.applies) {
            let msg = `Tag is in the future. Set status to 'Planned'?`;
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
          this.$nextTick(()=>{
              $store.commit('assets/touch');
          });
        }
        this.editedTag = null;
        this.tagDialog = false;
      },
      closeTag () {
        console.log('closeTag')
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
        var dateStr = date.toLocaleDateString();
        var reMonDay = new RegExp(`[-/.]?${date.getFullYear()}[-/.]?`);
        var monDayStr = dateStr.replace(reMonDay,'');
        return `${monDayStr} (${days} days)`;
      },
      cancelAsset() {
        this.$store.commit('select', null);
        this.$router.go(-1);
      },
      closeAsset() {
        console.log(`closeAsset()`);
        this.$store.commit('assets/updateAsset', this.asset);
        this.$store.commit('select', null);
        this.$router.go(-1);
      },
      noteSummary(tag) {
        var maxNote = 40;
        if (tag.noteUrl) {
          return tag.noteUrl.hostname;
        } else {
          return tag && tag.note && tag.note.length > maxNote
            ? tag.note.substring(0, maxNote) + '...'
            : tag.note;
        }
      },
    },
    computed: {
      tagChanged() {
        var mj = this.mj;
        var hash1 = mj.hash(this.tagModel);
        var hash2 = mj.hash(this.editedTag);
        return hash1 !== hash2;
      },
      assetChanged() {
        var mj = this.mj;
        var hashTag = mj.hash(this.tagList); // Fool Vue to watch taglist
        var hash1 = mj.hash(this.asset)+hashTag;
        var hash2 = mj.hash(this.$store.state.selection)+hashTag;
        return hash1 !== hash2;
      },
      isTagDateValid() {
        var tagModel = this.tagModel;
        return !tagModel.applies || tagModel.date < new Date();
      },
      isTagValid() {
        var tagModel = this.tagModel;
        return this.isTagDateValid && tagModel.name;
      },
      isAssetSelected() {
        return !!this.$store.state.selection;
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
          name,
        } = this.tagModel;
        var asset = this.assetStore.assetOfId(name);
        var hint = 
          asset && `\u2192${asset.name}` || 
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
      var selAsset = this.$store.state.selection;
      console.log(`edit-asset.mounted() `, selAsset);
      if (selAsset) {
        this.asset = new Asset(selAsset);
        this.tagList = this.asset.tagList;
      }
    },
    components: {
      AssetPicker,
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
.actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
