module Types
  class DesignVersionType < Types::BaseObject
    field :id, ID, null: false
    field :design_id, Integer, null: false
    field :label, String, null: false
    field :snapshot_state_json, GraphQL::Types::JSON, null: false
    field :created_by, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
