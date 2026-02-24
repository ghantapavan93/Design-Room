module Types
  class DesignEventType < Types::BaseObject
    field :id, ID, null: false
    field :design_id, Integer, null: false
    field :design_session_id, Integer
    field :actor_name, String, null: false
    field :actor_role, String
    field :actor_permission, String
    field :event_type, String, null: false
    field :region, String
    field :from_material_id, Integer
    field :to_material_id, Integer
    field :note, String
    field :client_txn_id, String
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
