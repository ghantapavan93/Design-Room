# Seed data for Design Room

puts "Cleaning database..."
Design.destroy_all
MaterialPreset.destroy_all

puts "Creating Material Presets..."
materials = [
  # Walls
  { category: 'walls', name: 'White Pine', brand: 'James Hardie', swatch_hex: '#e2e0d3', color_family: 'White', cost_band: '$$', sku: 'JH-WP-01', unit_type: 'sqft' },
  { category: 'walls', name: 'Charcoal Gray', brand: 'CertainTeed', swatch_hex: '#4d4f53', color_family: 'Gray', cost_band: '$', sku: 'CT-CG-01', unit_type: 'sqft' },
  { category: 'walls', name: 'Brick Red', brand: 'Glen-Gery', swatch_hex: '#a4463b', color_family: 'Red', cost_band: '$$$', sku: 'GG-BR-01', unit_type: 'sqft' },
  { category: 'walls', name: 'Navajo Beige', brand: 'Alside', swatch_hex: '#d6cba8', color_family: 'Beige', cost_band: '$', sku: 'AL-NB-01', unit_type: 'sqft' },
  { category: 'walls', name: 'Coastal Blue', brand: 'LP SmartSide', swatch_hex: '#6a7d8c', color_family: 'Blue', cost_band: '$$', sku: 'LP-CB-01', unit_type: 'sqft' },
  { category: 'walls', name: 'Sage Green', brand: 'Mastic', swatch_hex: '#8d9c82', color_family: 'Green', cost_band: '$$', sku: 'MA-SG-01', unit_type: 'sqft' },

  # Roof
  { category: 'roof', name: 'Onyx Black', brand: 'Owens Corning', swatch_hex: '#2b2c2d', color_family: 'Black', cost_band: '$$', sku: 'OC-OB-01', unit_type: 'sqft' },
  { category: 'roof', name: 'Estate Gray', brand: 'Owens Corning', swatch_hex: '#5f6368', color_family: 'Gray', cost_band: '$$', sku: 'OC-EG-01', unit_type: 'sqft' },
  { category: 'roof', name: 'Terra Cotta', brand: 'Boral', swatch_hex: '#bd533d', color_family: 'Red', cost_band: '$$$', sku: 'BO-TC-01', unit_type: 'sqft' },
  { category: 'roof', name: 'Desert Tan', brand: 'CertainTeed', swatch_hex: '#ab9b8e', color_family: 'Beige', cost_band: '$', sku: 'CT-DT-01', unit_type: 'sqft' },
  { category: 'roof', name: 'Weathered Wood', brand: 'GAF', swatch_hex: '#6b635c', color_family: 'Brown', cost_band: '$$', sku: 'GAF-WW-01', unit_type: 'sqft' },

  # Trim
  { category: 'trim', name: 'Arctic White', brand: 'James Hardie', swatch_hex: '#f5f5f5', color_family: 'White', cost_band: '$$', sku: 'JH-AW-01', unit_type: 'linear_ft' },
  { category: 'trim', name: 'Iron Gray', brand: 'James Hardie', swatch_hex: '#5c5e60', color_family: 'Gray', cost_band: '$$', sku: 'JH-IG-01', unit_type: 'linear_ft' },
  { category: 'trim', name: 'Monterey Taupe', brand: 'James Hardie', swatch_hex: '#a9a295', color_family: 'Beige', cost_band: '$$', sku: 'JH-MT-01', unit_type: 'linear_ft' },

  # Windows
  { category: 'windows', name: 'White', brand: 'Andersen', swatch_hex: '#ffffff', color_family: 'White', cost_band: '$$', sku: 'AN-WH-01', unit_type: 'each' },
  { category: 'windows', name: 'Black', brand: 'Pella', swatch_hex: '#212121', color_family: 'Black', cost_band: '$$$', sku: 'PE-BK-01', unit_type: 'each' },
  { category: 'windows', name: 'Bronze', brand: 'Marvin', swatch_hex: '#403830', color_family: 'Brown', cost_band: '$$$', sku: 'MA-BR-01', unit_type: 'each' }
]

material_records = materials.map do |mat|
  MaterialPreset.create!(mat)
end

puts "Creating Demo Design..."
design = Design.create!(title: '123 Maple Street')

puts "Setting initial state..."
design.create_design_state!(
  state_json: {
    'walls' => material_records.find { |m| m.name == 'White Pine' }.id,
    'roof' => material_records.find { |m| m.name == 'Estate Gray' }.id,
    'trim' => material_records.find { |m| m.name == 'Arctic White' }.id,
    'windows' => material_records.find { |m| m.name == 'White' }.id
  },
  last_saved_at: Time.current
)

puts "Creating pre-seeded versions..."
option_a = DesignVersion.create!(
  design: design,
  label: 'Option A Light Coastal',
  created_by: 'Alex Contractor',
  snapshot_state_json: {
    'walls' => material_records.find { |m| m.name == 'Coastal Blue' }.id,
    'roof' => material_records.find { |m| m.name == 'Onyx Black' }.id,
    'trim' => material_records.find { |m| m.name == 'Arctic White' }.id,
    'windows' => material_records.find { |m| m.name == 'Black' }.id
  }
)

option_b = DesignVersion.create!(
  design: design,
  label: 'Option B Modern Contrast',
  created_by: 'Alex Contractor',
  snapshot_state_json: {
    'walls' => material_records.find { |m| m.name == 'Charcoal Gray' }.id,
    'roof' => material_records.find { |m| m.name == 'Onyx Black' }.id,
    'trim' => material_records.find { |m| m.name == 'Arctic White' }.id,
    'windows' => material_records.find { |m| m.name == 'Black' }.id
  }
)

puts "Creating Share Links for Demo..."
live_link = ShareLink.create!(
  design: design,
  mode: 'live',
  permission: 'suggester'
)

puts "-" * 40
puts "Seeding complete!"
puts "Demo Design ID: #{design.id}"
puts "Live Room Link: /design/live/#{live_link.token}"
puts "-" * 40
