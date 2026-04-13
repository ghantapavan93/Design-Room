class AddClientTxnIdToMessagesAndComments < ActiveRecord::Migration[7.1]
  def change
    add_column :project_messages, :client_txn_id, :string unless column_exists?(:project_messages, :client_txn_id)
    add_index :project_messages, :client_txn_id unless index_exists?(:project_messages, :client_txn_id)

    add_column :region_comments, :client_txn_id, :string unless column_exists?(:region_comments, :client_txn_id)
    add_index :region_comments, :client_txn_id unless index_exists?(:region_comments, :client_txn_id)
  end
end
