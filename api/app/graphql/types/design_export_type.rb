module Types
  class DesignExportType < Types::BaseObject
    field :id, ID, null: false
    field :design_id, Integer, null: false
    field :design_version_id, Integer, null: true
    field :exported_by, String, null: false
    field :export_type, String, null: false
    field :version_label, String, null: true
    field :estimate_total, Float, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
