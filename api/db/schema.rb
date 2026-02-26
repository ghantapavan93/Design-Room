# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2024_02_01_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "design_events", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.bigint "design_session_id"
    t.string "actor_name", null: false
    t.string "actor_role"
    t.string "actor_permission"
    t.string "event_type", null: false
    t.string "region"
    t.integer "from_material_id"
    t.integer "to_material_id"
    t.text "note"
    t.string "client_txn_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id", "client_txn_id"], name: "index_design_events_on_design_id_and_client_txn_id", unique: true, where: "(client_txn_id IS NOT NULL)"
    t.index ["design_id"], name: "index_design_events_on_design_id"
    t.index ["design_session_id"], name: "index_design_events_on_design_session_id"
  end

  create_table "design_sessions", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id"], name: "index_design_sessions_on_design_id"
    t.index ["token"], name: "index_design_sessions_on_token", unique: true
  end

  create_table "design_states", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.jsonb "state_json", default: {}, null: false
    t.bigint "last_event_id"
    t.datetime "last_saved_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id"], name: "index_design_states_on_design_id"
  end

  create_table "design_versions", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.string "label", null: false
    t.jsonb "snapshot_state_json", default: {}, null: false
    t.string "created_by", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id"], name: "index_design_versions_on_design_id"
  end

  create_table "designs", force: :cascade do |t|
    t.string "title", null: false
    t.integer "final_version_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "material_presets", force: :cascade do |t|
    t.string "category", null: false
    t.string "name", null: false
    t.string "brand", null: false
    t.string "swatch_hex", null: false
    t.string "thumbnail_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "color_family"
    t.string "cost_band"
    t.string "sku"
    t.string "unit_type"
  end

  create_table "session_members", force: :cascade do |t|
    t.bigint "design_session_id", null: false
    t.string "display_name", null: false
    t.string "role", null: false
    t.string "permission", null: false
    t.datetime "last_seen_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_session_id", "display_name"], name: "index_session_members_on_design_session_id_and_display_name", unique: true
    t.index ["design_session_id"], name: "index_session_members_on_design_session_id"
  end

  create_table "share_links", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.string "token", null: false
    t.string "mode", null: false
    t.string "permission"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id"], name: "index_share_links_on_design_id"
    t.index ["token"], name: "index_share_links_on_token", unique: true
  end

  add_foreign_key "design_events", "design_sessions"
  add_foreign_key "design_events", "designs"
  add_foreign_key "design_sessions", "designs"
  add_foreign_key "design_states", "designs"
  add_foreign_key "design_versions", "designs"
  add_foreign_key "session_members", "design_sessions"
  add_foreign_key "share_links", "designs"
end
