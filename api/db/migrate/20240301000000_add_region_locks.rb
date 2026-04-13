class AddRegionLocks < ActiveRecord::Migration[7.1]
  def change
    create_table :region_locks do |t|
      t.references :design, null: false, foreign_key: true
      t.string :region, null: false
      t.string :locked_by, null: false
      t.string :lock_reason  # 'approved' | 'manual'
      t.datetime :expires_at
      t.timestamps
    end

    add_index :region_locks, [:design_id, :region], unique: true
  end
end
