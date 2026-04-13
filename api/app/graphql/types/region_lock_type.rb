module Types
  class RegionLockType < Types::BaseObject
    field :id, ID, null: false
    field :region, String, null: false
    field :locked_by, String, null: false
    field :lock_reason, String
    field :expires_at, GraphQL::Types::ISO8601DateTime
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
