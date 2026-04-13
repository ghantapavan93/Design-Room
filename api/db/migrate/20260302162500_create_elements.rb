class CreateElements < ActiveRecord::Migration[7.1]
  def change
    create_table :elements do |t|
      t.references :design, null: false, foreign_key: true
      t.string :label, null: false
      t.string :kind, null: false
      t.string :group_key, null: false
      t.string :mask_url, null: false
      t.integer :sort_order, default: 0

      t.timestamps
    end
  end
end
