class DesignExport < ApplicationRecord
  belongs_to :design_workspace, optional: true
  belongs_to :design
  belongs_to :design_version, optional: true

  validates :exported_by, presence: true
  validates :export_type, presence: true, inclusion: { in: %w[proposal summary] }
end
