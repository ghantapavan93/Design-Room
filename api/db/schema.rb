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

ActiveRecord::Schema[7.1].define(version: 2026_03_29_000300) do
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

  create_table "design_exports", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.bigint "design_version_id"
    t.string "exported_by", null: false
    t.string "export_type", null: false
    t.string "version_label"
    t.decimal "estimate_total", precision: 12, scale: 2
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id"], name: "index_design_exports_on_design_id"
    t.index ["design_version_id"], name: "index_design_exports_on_design_version_id"
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
    t.string "base_media_url"
    t.string "masks_url_prefix"
    t.boolean "mask_ready", default: false, null: false
  end

  create_table "elements", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.string "label", null: false
    t.string "kind", null: false
    t.string "group_key", null: false
    t.string "mask_url", null: false
    t.integer "sort_order", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id"], name: "index_elements_on_design_id"
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

  create_table "project_messages", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.string "author_name", null: false
    t.string "author_role", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "client_txn_id"
    t.index ["client_txn_id"], name: "index_project_messages_on_client_txn_id"
    t.index ["created_at"], name: "index_project_messages_on_created_at"
    t.index ["design_id"], name: "index_project_messages_on_design_id"
  end

  create_table "region_comments", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.string "region", null: false
    t.string "author_name", null: false
    t.string "author_role"
    t.text "body", null: false
    t.datetime "resolved_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "client_txn_id"
    t.index ["client_txn_id"], name: "index_region_comments_on_client_txn_id"
    t.index ["design_id", "region"], name: "index_region_comments_on_design_id_and_region"
    t.index ["design_id"], name: "index_region_comments_on_design_id"
  end

  create_table "region_locks", force: :cascade do |t|
    t.bigint "design_id", null: false
    t.string "region", null: false
    t.string "locked_by", null: false
    t.string "lock_reason"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["design_id", "region"], name: "index_region_locks_on_design_id_and_region", unique: true
    t.index ["design_id"], name: "index_region_locks_on_design_id"
  end

  create_table "session_members", force: :cascade do |t|
    t.bigint "design_session_id", null: false
    t.string "display_name", null: false
    t.string "role", null: false
    t.string "permission", null: false
    t.datetime "last_seen_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "participant_id"
    t.index ["design_session_id", "display_name"], name: "index_session_members_on_design_session_id_and_display_name", unique: true
    t.index ["design_session_id", "participant_id"], name: "idx_session_members_on_session_and_participant", unique: true, where: "(participant_id IS NOT NULL)"
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
    t.datetime "revoked_at"
    t.datetime "last_accessed_at"
    t.index ["design_id"], name: "index_share_links_on_design_id"
    t.index ["token"], name: "index_share_links_on_token", unique: true
  end

  add_foreign_key "design_events", "design_sessions"
  add_foreign_key "design_events", "designs"
  add_foreign_key "design_exports", "design_versions"
  add_foreign_key "design_exports", "designs"
  add_foreign_key "design_sessions", "designs"
  add_foreign_key "design_states", "designs"
  add_foreign_key "design_versions", "designs"
  add_foreign_key "elements", "designs"
  add_foreign_key "project_messages", "designs"
  add_foreign_key "region_comments", "designs"
  add_foreign_key "region_locks", "designs"
  add_foreign_key "session_members", "design_sessions"
  add_foreign_key "share_links", "designs"
end
