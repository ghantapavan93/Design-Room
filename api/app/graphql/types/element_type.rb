module Types
  class ElementType < Types::BaseObject
    field :id, ID, null: false
    field :design_id, Integer, null: false
    field :label, String, null: false
    field :kind, String, null: false
    field :group_key, String, null: false
    field :mask_url, String, null: false
    field :sort_order, Integer, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
