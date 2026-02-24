# Seed data for Design Room

puts "Cleaning database..."
Design.destroy_all
MaterialPreset.destroy_all

puts "Creating Material Presets..."
materials = [
  # Walls
  { category: 'walls', name: 'White Pine', brand: 'James Hardie', swatch_hex: '#e2e0d3' },
  { category: 'walls', name: 'Charcoal Gray', brand: 'CertainTeed', swatch_hex: '#4d4f53' },
  { category: 'walls', name: 'Brick Red', brand: 'Glen-Gery', swatch_hex: '#a4463b' },
  { category: 'walls', name: 'Navajo Beige', brand: 'Alside', swatch_hex: '#d6cba8' },
  { category: 'walls', name: 'Coastal Blue', brand: 'LP SmartSide', swatch_hex: '#6a7d8c' },
  { category: 'walls', name: 'Sage Green', brand: 'Mastic', swatch_hex: '#8d9c82' },

  # Roof
  { category: 'roof', name: 'Onyx Black', brand: 'Owens Corning', swatch_hex: '#2b2c2d' },
  { category: 'roof', name: 'Estate Gray', brand: 'Owens Corning', swatch_hex: '#5f6368' },
  { category: 'roof', name: 'Terra Cotta', brand: 'Boral', swatch_hex: '#bd533d' },
  { category: 'roof', name: 'Desert Tan', brand: 'CertainTeed', swatch_hex: '#ab9b8e' },
  { category: 'roof', name: 'Weathered Wood', brand: 'GAF', swatch_hex: '#6b635c' },

  # Trim
  { category: 'trim', name: 'Arctic White', brand: 'James Hardie', swatch_hex: '#f5f5f5' },
  { category: 'trim', name: 'Iron Gray', brand: 'James Hardie', swatch_hex: '#5c5e60' },
  { category: 'trim', name: 'Monterey Taupe', brand: 'James Hardie', swatch_hex: '#a9a295' },

  # Windows
  { category: 'windows', name: 'White', brand: 'Andersen', swatch_hex: '#ffffff' },
  { category: 'windows', name: 'Black', brand: 'Pella', swatch_hex: '#212121' },
  { category: 'windows', name: 'Bronze', brand: 'Marvin', swatch_hex: '#403830' }
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
