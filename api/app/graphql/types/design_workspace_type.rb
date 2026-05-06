module Types
  class DesignWorkspaceType < Types::BaseObject
    field :id, ID, null: false
    field :state_json, GraphQL::Types::JSON, null: false
    field :last_event_id, String, null: true
    field :final_version_id, ID, null: true
    field :created_by_participant_id, String, null: true
    field :label, String, null: true
    field :expires_at, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
