require 'rails_helper'

RSpec.describe "GraphQL Mutations - ToggleRegionLock", type: :request do
  let(:design) { Design.create!(title: "Test Design") }
  let(:session) { DesignSession.create!(design: design, token: "valid-token", display_name: "Staff Lex", role: "editor") }

  let(:query) do
    <<~GQL
      mutation ToggleRegionLock($designId: ID!, $region: String!, $designSessionToken: String!) {
        toggleRegionLock(designId: $designId, region: $region, designSessionToken: $designSessionToken) {
          success
          errors
          regionLock {
            region
            lockedBy
          }
        }
      }
    GQL
  end

  it "locks a region successfully with a valid session" do
    post "/graphql", params: {
      query: query,
      variables: {
        designId: design.id,
        region: "walls",
        designSessionToken: "valid-token"
      }
    }

    json = JSON.parse(response.body)
    data = json.dig("data", "toggleRegionLock")

    expect(data["success"]).to be true
    expect(data.dig("regionLock", "region")).to eq("walls")
    expect(data.dig("regionLock", "lockedBy")).to eq("Staff Lex")
    expect(RegionLock.count).to eq(1)
  end

  it "fails to lock a region with an invalid session" do
    post "/graphql", params: {
      query: query,
      variables: {
        designId: design.id,
        region: "walls",
        designSessionToken: "invalid-token"
      }
    }

    json = JSON.parse(response.body)
    data = json.dig("data", "toggleRegionLock")

    expect(data["success"]).to be false
    expect(data["errors"]).to include("Invalid or expired session")
  end

  it "enforces atomicity and uniqueness for concurrent locks" do
    RegionLock.create!(design: design, region: "walls", locked_by: "Other User")

    post "/graphql", params: {
      query: query,
      variables: {
        designId: design.id,
        region: "walls",
        designSessionToken: "valid-token"
      }
    }

    json = JSON.parse(response.body)
    data = json.dig("data", "toggleRegionLock")

    expect(data["success"]).to be false
    expect(data["errors"]).to include("Region is already locked by another user")
  end
end
