class ProjectMessage < ApplicationRecord
  belongs_to :design_workspace, optional: true
  belongs_to :design

  validates :body, presence: true
  validates :author_name, presence: true
  validates :author_role, inclusion: { in: %w[contractor homeowner viewer] }
end
