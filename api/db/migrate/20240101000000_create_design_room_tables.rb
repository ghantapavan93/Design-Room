class CreateDesignRoomTables < ActiveRecord::Migration[7.1]
  def change
    create_table :designs do |t|
      t.string :title, null: false
      t.integer :final_version_id
      t.timestamps
    end

    create_table :design_states do |t|
      t.references :design, null: false, foreign_key: true
      t.jsonb :state_json, null: false, default: {}
      t.bigint :last_event_id
      t.datetime :last_saved_at
      t.timestamps
    end

    create_table :material_presets do |t|
      t.string :category, null: false
      t.string :name, null: false
      t.string :brand, null: false
      t.string :swatch_hex, null: false
      t.string :thumbnail_url
      t.timestamps
    end

    create_table :design_sessions do |t|
      t.references :design, null: false, foreign_key: true
      t.string :token, null: false, index: { unique: true }
      t.timestamps
    end

    create_table :session_members do |t|
      t.references :design_session, null: false, foreign_key: true
      t.string :display_name, null: false
      t.string :role, null: false
      t.string :permission, null: false
      t.datetime :last_seen_at
      t.timestamps
      t.index [:design_session_id, :display_name], unique: true
    end

    create_table :design_events do |t|
      t.references :design, null: false, foreign_key: true
      t.references :design_session, foreign_key: true
      t.string :actor_name, null: false
      t.string :actor_role
      t.string :actor_permission
      t.string :event_type, null: false
      t.string :region
      t.integer :from_material_id
      t.integer :to_material_id
      t.text :note
      t.string :client_txn_id
      t.timestamps
    end

    # Idempotency constraint on database level
    add_index :design_events, [:design_id, :client_txn_id], unique: true, where: 'client_txn_id IS NOT NULL'

    create_table :design_versions do |t|
      t.references :design, null: false, foreign_key: true
      t.string :label, null: false
      t.jsonb :snapshot_state_json, null: false, default: {}
      t.string :created_by, null: false
      t.timestamps
    end

    create_table :share_links do |t|
      t.references :design, null: false, foreign_key: true
      t.string :token, null: false, index: { unique: true }
      t.string :mode, null: false
      t.string :permission
      t.datetime :expires_at
      t.timestamps
    end
  end
end
