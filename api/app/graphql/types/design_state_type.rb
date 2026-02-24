module Types
  class DesignStateType < Types::BaseObject
    field :id, ID, null: false
    field :state_json, GraphQL::Types::JSON, null: false
    field :last_event_id, Integer
    field :last_saved_at, GraphQL::Types::ISO8601DateTime
  end
end
