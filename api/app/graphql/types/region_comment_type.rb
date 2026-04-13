module Types
  class RegionCommentType < Types::BaseObject
    field :id, ID, null: false
    field :region, String, null: false
    field :author_name, String, null: false
    field :author_role, String, null: false
    field :body, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :resolved_at, GraphQL::Types::ISO8601DateTime, null: true
    field :client_txn_id, String, null: true
  end
end
