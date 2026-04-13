class AddShareLinkLifecycle < ActiveRecord::Migration[7.1]
  def change
    add_column :share_links, :revoked_at, :datetime, null: true
    add_column :share_links, :last_accessed_at, :datetime, null: true
  end
end
