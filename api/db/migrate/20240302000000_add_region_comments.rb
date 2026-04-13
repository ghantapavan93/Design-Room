class AddRegionComments < ActiveRecord::Migration[7.1]
  def change
    create_table :region_comments do |t|
      t.references :design, null: false, foreign_key: true
      t.string :region, null: false
      t.string :author_name, null: false
      t.string :author_role   # 'contractor' | 'homeowner'
      t.text :body, null: false
      t.datetime :resolved_at
      t.timestamps
    end

    add_index :region_comments, [:design_id, :region]
  end
end
