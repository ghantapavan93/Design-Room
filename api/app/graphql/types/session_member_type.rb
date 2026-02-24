module Types
  class SessionMemberType < Types::BaseObject
    field :id, ID, null: false
    field :design_session_id, Integer, null: false
    field :display_name, String, null: false
    field :role, String, null: false
    field :permission, String, null: false
    field :last_seen_at, GraphQL::Types::ISO8601DateTime
  end
end
