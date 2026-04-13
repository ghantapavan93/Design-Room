require 'rails_helper'

RSpec.describe 'GraphQL API', type: :request do
  let!(:design) { Design.create!(title: 'Test Design') }
  let!(:state) { design.create_design_state!(state_json: { 'walls' => 1 }, last_saved_at: Time.current) }
  let!(:session) { design.design_sessions.create!(token: 'test-token') }
  let!(:member) { SessionMember.create!(design_session: session, display_name: 'Alice', role: 'contractor', permission: 'editor') }

  describe 'applyMaterial mutation' do
    let(:query) do
      <<~GQL
        mutation($input: ApplyMaterialInput!) {
          applyMaterial(input: $input) {
            success
            errors
            errorCode
            event {
              id
              region
              toMaterialId
            }
          }
        }
      GQL
    end

    let(:variables) do
      {
        input: {
          designId: design.id.to_s,
          region: 'walls',
          materialId: '2',
          actorName: 'Alice',
          clientTxnId: 'txn-1',
          designSessionToken: session.token
        }
      }
    end

    it 'creates an event and updates design state' do
      expect {
        post '/graphql', params: { query: query, variables: variables }
      }.to change(DesignEvent, :count).by(1)

      json = JSON.parse(response.body)
      data = json.dig('data', 'applyMaterial')

      expect(data['success']).to be true
      expect(data['event']['region']).to eq('walls')
      
      design.reload
      expect(design.design_state.state_json['walls']).to eq('2')
    end

    it 'handles conflicts deterministically' do
      # Simulate a recent event by someone else
      DesignEvent.create!(
        design_session: session,
        event_type: 'apply_material',
        region: 'walls',
        actor_name: 'Bob',
        client_txn_id: 'txn-0'
      )

      expect {
        post '/graphql', params: { query: query, variables: variables }
      }.not_to change(DesignEvent, :count)

      json = JSON.parse(response.body)
      data = json.dig('data', 'applyMaterial')

      expect(data['success']).to be false
      expect(data['errorCode']).to eq('CONFLICT')
    end
  end

  describe 'approveSuggestion mutation' do
    let(:suggest_event) do
      DesignEvent.create!(
        design_session: session,
        event_type: 'suggest_material',
        region: 'roof',
        actor_name: 'Bob',
        to_material_id: 3,
        client_txn_id: 'txn-suggest-1'
      )
    end

    let(:query) do
      <<~GQL
        mutation($input: ApproveSuggestionInput!) {
          approveSuggestion(input: $input) {
            success
            errors
            event {
              id
              eventType
            }
          }
        }
      GQL
    end

    let(:variables) do
      {
        input: {
          eventId: suggest_event.id.to_s,
          actorName: 'Alice',
          clientTxnId: 'txn-approve-1',
          designSessionToken: session.token
        }
      }
    end

    it 'mutates state, creates approve event, enforces idempotency' do
      expect {
        post '/graphql', params: { query: query, variables: variables }
      }.to change(DesignEvent, :count).by(1)

      json = JSON.parse(response.body)
      data = json.dig('data', 'approveSuggestion')

      expect(data['success']).to be true
      expect(data['event']['eventType']).to eq('approve_suggestion')

      design.reload
      expect(design.design_state.state_json['roof']).to eq(3)

      # Test idempotency - replay same mutation
      expect {
        post '/graphql', params: { query: query, variables: variables }
      }.not_to change(DesignEvent, :count)

      json2 = JSON.parse(response.body)
      expect(json2.dig('data', 'approveSuggestion', 'success')).to be true
    end
  end
end
