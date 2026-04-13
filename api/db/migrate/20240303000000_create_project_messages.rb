class CreateProjectMessages < ActiveRecord::Migration[7.1]
  def change
    create_table :project_messages do |t|
      t.references :design, null: false, foreign_key: true
      t.string :author_name, null: false
      t.string :author_role, null: false
      t.text :body, null: false
      t.timestamps
    end
    add_index :project_messages, :created_at
  end
end
