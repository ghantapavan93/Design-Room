require 'rails_helper'

RSpec.describe DesignEvent, type: :model do
  describe 'idempotency behavior' do
    let(:design) { Design.create!(title: 'Test Design') }
    let(:client_txn_id) { '123-abc-txn' }

    it 'enforces uniqueness on design_id and client_txn_id via database index' do
      # Create initial event
      expect {
        DesignEvent.create!(
          design: design,
          event_type: 'apply_material',
          actor_name: 'Test Actor',
          region: 'walls',
          client_txn_id: client_txn_id
        )
      }.not_to raise_error

      # Attempt to create duplicate event
      expect {
        DesignEvent.create!(
          design: design,
          event_type: 'suggest_material',
          actor_name: 'Another Actor',
          region: 'roof',
          client_txn_id: client_txn_id
        )
      }.to raise_error(ActiveRecord::RecordNotUnique)
    end
    
    it 'allows null client_txn_id for multiple events (if optional)' do
      expect {
        DesignEvent.create!(
          design: design,
          event_type: 'apply_material',
          actor_name: 'Test Actor',
          region: 'walls',
          client_txn_id: nil
        )
        
        DesignEvent.create!(
          design: design,
          event_type: 'suggest_material',
          actor_name: 'Another Actor',
          region: 'roof',
          client_txn_id: nil
        )
      }.not_to raise_error
    end
  end
end
