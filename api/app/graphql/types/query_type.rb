module Types
  class QueryType < Types::BaseObject
    field :design, Types::DesignType, null: false do
      argument :id, ID, required: true
      argument :events_after_id, Integer, required: false
    end

    def design(id:, events_after_id: nil)
      Design.find(id)
    end

    field :materials, [Types::MaterialPresetType], null: false do
      argument :category, String, required: false
      argument :search, String, required: false
    end

    def materials(category: nil, search: nil)
      scope = MaterialPreset.all
      scope = scope.where(category: category) if category.present?
      scope = scope.where('name ILIKE ?', "%#{search}%") if search.present?
      scope
    end

    field :share_link, Types::ShareLinkType, null: false do
      argument :token, String, required: true
    end

    def share_link(token:)
      ShareLink.find_by!(token: token)
    end

    field :events, [Types::DesignEventType], null: false do
      argument :design_id, ID, required: true
      argument :after_id, Integer, required: false
    end

    def events(design_id:, after_id: nil)
      scope = DesignEvent.where(design_id: design_id).order(id: :asc)
      scope = scope.where('id > ?', after_id) if after_id
      scope
    end
  end
end
