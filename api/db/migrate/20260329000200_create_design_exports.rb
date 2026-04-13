class CreateDesignExports < ActiveRecord::Migration[7.1]
  def change
    create_table :design_exports do |t|
      t.references :design, null: false, foreign_key: true
      t.references :design_version, null: true, foreign_key: true
      t.string :exported_by, null: false
      t.string :export_type, null: false  # 'proposal' or 'summary'
      t.string :version_label
      t.decimal :estimate_total, precision: 12, scale: 2
      t.timestamps
    end
  end
end
