class AddParticipantIdToSessionMembers < ActiveRecord::Migration[7.1]
  def change
    add_column :session_members, :participant_id, :string, null: true
    add_index :session_members, [:design_session_id, :participant_id],
              unique: true,
              where: "participant_id IS NOT NULL",
              name: "idx_session_members_on_session_and_participant"
  end
end
