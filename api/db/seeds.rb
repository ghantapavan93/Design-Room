# Seed data for Design Room

puts "Cleaning database..."
Design.destroy_all
MaterialPreset.destroy_all

puts "Creating Material Presets..."
materials = [
  # --- WALLS: Whites & Beiges ---
  { category: 'walls', name: 'Alabaster White', brand: 'Sherwin-Williams', swatch_hex: '#ecebe4', color_family: 'White', cost_band: '$', sku: 'SW-7008' },
  { category: 'walls', name: 'Swiss Coffee', brand: 'Benjamin Moore', swatch_hex: '#f1eee5', color_family: 'White', cost_band: '$$', sku: 'BM-OC-45' },
  { category: 'walls', name: 'Arctic White', brand: 'James Hardie', swatch_hex: '#f5f5f5', color_family: 'White', cost_band: '$$', sku: 'JH-AW-01' },
  { category: 'walls', name: 'Accessible Beige', brand: 'Sherwin-Williams', swatch_hex: '#d1c7b8', color_family: 'Beige', cost_band: '$', sku: 'SW-7036' },
  { category: 'walls', name: 'Manchester Tan', brand: 'Benjamin Moore', swatch_hex: '#d6cba8', color_family: 'Beige', cost_band: '$$', sku: 'BM-HC-81' },
  { category: 'walls', name: 'Desert Sand', brand: 'Valspar', swatch_hex: '#d4c4a0', color_family: 'Beige', cost_band: '$', sku: 'VS-DS-01' },

  # --- WALLS: Grays & Blacks ---
  { category: 'walls', name: 'Agreeable Gray', brand: 'Sherwin-Williams', swatch_hex: '#d1cbc1', color_family: 'Gray', cost_band: '$', sku: 'SW-7029' },
  { category: 'walls', name: 'Repose Gray', brand: 'Sherwin-Williams', swatch_hex: '#ccc5bc', color_family: 'Gray', cost_band: '$', sku: 'SW-7015' },
  { category: 'walls', name: 'Iron Ore', brand: 'Sherwin-Williams', swatch_hex: '#434341', color_family: 'Black', cost_band: '$$', sku: 'SW-7069' },
  { category: 'walls', name: 'Kendall Charcoal', brand: 'Benjamin Moore', swatch_hex: '#525450', color_family: 'Gray', cost_band: '$$$', sku: 'BM-HC-166' },
  { category: 'walls', name: 'Black Beauty', brand: 'Benjamin Moore', swatch_hex: '#3c3c3c', color_family: 'Black', cost_band: '$$', sku: 'BM-2128-10' },
  { category: 'walls', name: 'Slate Gray', brand: 'James Hardie', swatch_hex: '#5a5f63', color_family: 'Gray', cost_band: '$$$', sku: 'JH-SG-02' },

  # --- WALLS: Colors (Blues, Greens, Reds) ---
  { category: 'walls', name: 'Naval Blue', brand: 'Sherwin-Williams', swatch_hex: '#2e3d4c', color_family: 'Blue', cost_band: '$$', sku: 'SW-6244' },
  { category: 'walls', name: 'Hale Navy', brand: 'Benjamin Moore', swatch_hex: '#37414f', color_family: 'Blue', cost_band: '$$$', sku: 'BM-HC-154' },
  { category: 'walls', name: 'Coastal Blue', brand: 'LP SmartSide', swatch_hex: '#4a7fa5', color_family: 'Blue', cost_band: '$$', sku: 'LP-CB-01' },
  { category: 'walls', name: 'Pewter Green', brand: 'Sherwin-Williams', swatch_hex: '#5d6256', color_family: 'Green', cost_band: '$$', sku: 'SW-6208' },
  { category: 'walls', name: 'Waller Green', brand: 'Benjamin Moore', swatch_hex: '#2e3b2f', color_family: 'Green', cost_band: '$$$', sku: 'BM-CW-510' },
  { category: 'walls', name: 'Rookwood Red', brand: 'Sherwin-Williams', swatch_hex: '#743c36', color_family: 'Red', cost_band: '$$', sku: 'SW-2802' },
  { category: 'walls', name: 'Brick Red', brand: 'CertainTeed', swatch_hex: '#a4463b', color_family: 'Red', cost_band: '$$', sku: 'CT-BR-01' },

  # --- ROOF ---
  { category: 'roof', name: 'Onyx Black', brand: 'Owens Corning', swatch_hex: '#2b2c2d', color_family: 'Black', cost_band: '$$', sku: 'OC-OB-01' },
  { category: 'roof', name: 'Estate Gray', brand: 'Owens Corning', swatch_hex: '#5f6368', color_family: 'Gray', cost_band: '$$', sku: 'OC-EG-01' },
  { category: 'roof', name: 'Weathered Wood', brand: 'GAF', swatch_hex: '#6b635c', color_family: 'Brown', cost_band: '$', sku: 'GAF-WW-01' },
  { category: 'roof', name: 'Charcoal Black', brand: 'GAF', swatch_hex: '#333333', color_family: 'Black', cost_band: '$$', sku: 'GAF-CB-01' },
  { category: 'roof', name: 'Moire Black', brand: 'CertainTeed', swatch_hex: '#242526', color_family: 'Black', cost_band: '$$$', sku: 'CT-MB-01' },
  { category: 'roof', name: 'Georgetown Gray', brand: 'CertainTeed', swatch_hex: '#8c8d8e', color_family: 'Gray', cost_band: '$', sku: 'CT-GG-01' },
  { category: 'roof', name: 'Terra Cotta Tile', brand: 'Boral', swatch_hex: '#bd533d', color_family: 'Red', cost_band: '$$$', sku: 'BO-TC-01' },
  { category: 'roof', name: 'Pacific Blue Metal', brand: 'Drexel', swatch_hex: '#2c4d63', color_family: 'Blue', cost_band: '$$$', sku: 'DX-PB-01' },
  { category: 'roof', name: 'Antique White', brand: 'DaVinci', swatch_hex: '#edeae0', color_family: 'White', cost_band: '$$$', sku: 'DV-AW-01' },

  # --- DOORS & GARAGE ---
  { category: 'door', name: 'Tricorn Black', brand: 'Sherwin-Williams', swatch_hex: '#2b2c2d', color_family: 'Black', cost_band: '$', sku: 'SW-6258' },
  { category: 'door', name: 'Door Red', brand: 'Benjamin Moore', swatch_hex: '#a42a2b', color_family: 'Red', cost_band: '$$', sku: 'BM-2086-10' },
  { category: 'door', name: 'Wythe Blue', brand: 'Benjamin Moore', swatch_hex: '#96b4ad', color_family: 'Blue', cost_band: '$$', sku: 'BM-HC-143' },
  { category: 'door', name: 'Natural Oak', brand: 'Therma-Tru', swatch_hex: '#bc8a5f', color_family: 'Brown', cost_band: '$$$', sku: 'TT-NO-01' },
  { category: 'door', name: 'Dark Walnut', brand: 'Therma-Tru', swatch_hex: '#4d3a2b', color_family: 'Brown', cost_band: '$$$', sku: 'TT-DW-01' },
  { category: 'garage', name: 'Modern Charcoal', brand: 'Clopay', swatch_hex: '#515356', color_family: 'Gray', cost_band: '$$', sku: 'CP-MC-01' },
  { category: 'garage', name: 'Classic White', brand: 'Clopay', swatch_hex: '#fcfcfc', color_family: 'White', cost_band: '$', sku: 'CP-CW-01' },
  { category: 'garage', name: 'Sandstone', brand: 'Amarr', swatch_hex: '#cec3b1', color_family: 'Beige', cost_band: '$', sku: 'AM-SS-01' },
  { category: 'garage', name: 'Hunter Green', brand: 'Amarr', swatch_hex: '#2e3b2f', color_family: 'Green', cost_band: '$$', sku: 'AM-HG-01' },

  # --- TRIM ---
  { category: 'trim', name: 'Extra White', brand: 'Sherwin-Williams', swatch_hex: '#f0f0ed', color_family: 'White', cost_band: '$', sku: 'SW-7006' },
  { category: 'trim', name: 'Iron Gray', brand: 'James Hardie', swatch_hex: '#5c5e60', color_family: 'Gray', cost_band: '$$', sku: 'JH-IG-01' },
  { category: 'trim', name: 'Naval Blue', brand: 'Sherwin-Williams', swatch_hex: '#2e3d4c', color_family: 'Blue', cost_band: '$', sku: 'SW-6244-T' },
  { category: 'trim', name: 'Rich Espresso', brand: 'Valspar', swatch_hex: '#3d322b', color_family: 'Brown', cost_band: '$', sku: 'VS-RE-01' },
  { category: 'trim', name: 'Monterey Taupe', brand: 'James Hardie', swatch_hex: '#a9a295', color_family: 'Beige', cost_band: '$$', sku: 'JH-MT-01' },

  # --- WINDOWS ---
  { category: 'windows', name: 'White Vinyl', brand: 'Andersen', swatch_hex: '#ffffff', color_family: 'White', cost_band: '$$', sku: 'AN-WH-01' },
  { category: 'windows', name: 'Black Bronze', brand: 'Pella', swatch_hex: '#212121', color_family: 'Black', cost_band: '$$$', sku: 'PE-BK-01' },
  { category: 'windows', name: 'Dark Bronze', brand: 'Marvin', swatch_hex: '#403830', color_family: 'Brown', cost_band: '$$$', sku: 'MA-BR-01' },
  { category: 'windows', name: 'Sandstone', brand: 'Andersen', swatch_hex: '#cec3b1', color_family: 'Beige', cost_band: '$$', sku: 'AN-SS-01' },
]

material_records = materials.map do |mat|
  MaterialPreset.create!(mat)
end

puts "Creating Demo Designs..."

# House 1 - High End Suburban
design1 = Design.create!(
  id: 1, 
  title: '123 Coastal Estate', 
  base_media_url: '/demo/coastal/base.jpg',
  masks_url_prefix: '/demo/coastal',
  mask_ready: true
)
design1.create_design_state!(
  state_json: {
    'walls' => material_records.find { |m| m.name == 'Coastal Blue' }.id,
    'roof' => material_records.find { |m| m.name == 'Onyx Black' }.id,
    'trim' => material_records.find { |m| m.name == 'Arctic White' }.id,
    'windows' => material_records.find { |m| m.name == 'Black Bronze' }.id,
    'door' => material_records.find { |m| m.name == 'Monterey Taupe' }.id,
    'garage' => material_records.find { |m| m.name == 'Modern Charcoal' }.id
  },
  last_saved_at: Time.current
)

design1.elements.create!([
  { label: 'Main Roof', kind: 'roof', group_key: 'roof', mask_url: 'mask_roof.png', sort_order: 1 },
  { label: 'Left Window', kind: 'window', group_key: 'windows', mask_url: 'window_1.png', sort_order: 2 },
  { label: 'Right Window', kind: 'window', group_key: 'windows', mask_url: 'window_2.png', sort_order: 3 },
  { label: 'Exterior Trim', kind: 'trim', group_key: 'trim', mask_url: 'mask_trim.png', sort_order: 4 },
  { label: 'Front Door', kind: 'door', group_key: 'door', mask_url: 'mask_door.png', sort_order: 5 },
  { label: 'Garage Door', kind: 'garage', group_key: 'garage', mask_url: 'mask_garage.png', sort_order: 6 }
])

# House 2 - Classic Upgrade
design2 = Design.create!(
  id: 2, 
  title: '456 Craftsman Mod', 
  base_media_url: '/demo/craftsman/base.jpg',
  masks_url_prefix: '/demo/craftsman',
  mask_ready: true
)
design2.create_design_state!(
  state_json: {
    'walls' => material_records.find { |m| m.name == 'Manchester Tan' }.id,
    'roof' => material_records.find { |m| m.name == 'Terra Cotta Tile' }.id,
    'trim' => material_records.find { |m| m.name == 'Monterey Taupe' }.id,
    'windows' => material_records.find { |m| m.name == 'Dark Bronze' }.id,
    'door' => material_records.find { |m| m.name == 'Monterey Taupe' }.id,
    'garage' => material_records.find { |m| m.name == 'Modern Charcoal' }.id
  },
  last_saved_at: Time.current
)

design2.elements.create!([
  { label: 'Main Roof', kind: 'roof', group_key: 'roof', mask_url: 'mask_roof.png', sort_order: 1 },
  { label: 'Left Window', kind: 'window', group_key: 'windows', mask_url: 'window_1.png', sort_order: 2 },
  { label: 'Right Window', kind: 'window', group_key: 'windows', mask_url: 'window_2.png', sort_order: 3 },
  { label: 'Exterior Trim', kind: 'trim', group_key: 'trim', mask_url: 'mask_trim.png', sort_order: 4 },
  { label: 'Front Door', kind: 'door', group_key: 'door', mask_url: 'mask_door.png', sort_order: 5 }
])

# House 3 - Default Empty (For new builder flow)
design3 = Design.create!(
  id: 3, 
  title: '789 Blank Canvas', 
  base_media_url: '/demo/blank/base.jpg',
  masks_url_prefix: '/demo/blank',
  mask_ready: false
)
design3.create_design_state!(
  state_json: {
    'walls' => material_records.find { |m| m.name == 'Alabaster White' }.id,
    'roof' => material_records.find { |m| m.name == 'Estate Gray' }.id,
    'trim' => material_records.find { |m| m.name == 'Arctic White' }.id,
    'windows' => material_records.find { |m| m.name == 'White Vinyl' }.id
  },
  last_saved_at: Time.current
)

puts "Creating Pre-seeded options for House 1..."
option_a = DesignVersion.create!(
  design: design1,
  label: 'Option A Light Coastal',
  created_by: 'Alex Contractor',
  snapshot_state_json: {
    'walls' => material_records.find { |m| m.name == 'Coastal Blue' }.id,
    'roof' => material_records.find { |m| m.name == 'Onyx Black' }.id,
    'trim' => material_records.find { |m| m.name == 'Arctic White' }.id,
    'windows' => material_records.find { |m| m.name == 'Black Bronze' }.id
  }
)

option_b = DesignVersion.create!(
  design: design1,
  label: 'Option B Dark Modern',
  created_by: 'Alex Contractor',
  snapshot_state_json: {
    'walls' => material_records.find { |m| m.name == 'Modern Charcoal' }.id,
    'roof' => material_records.find { |m| m.name == 'Onyx Black' }.id,
    'trim' => material_records.find { |m| m.name == 'Iron Gray' }.id,
    'windows' => material_records.find { |m| m.name == 'Black Bronze' }.id
  }
)

puts "Creating Share Links for Demos..."
live_link1 = ShareLink.create!(design: design1, mode: 'live', permission: 'suggester')
live_link2 = ShareLink.create!(design: design2, mode: 'live', permission: 'suggester')
live_link3 = ShareLink.create!(design: design3, mode: 'live', permission: 'suggester')

# View-only share links (P1 item 8)
view_link1 = ShareLink.create!(design: design1, mode: 'view')
view_link2 = ShareLink.create!(design: design2, mode: 'view')
view_link3 = ShareLink.create!(design: design3, mode: 'view')

puts "-" * 40
puts "Seeding complete!"
puts "Live Room Link 1 (Full Demo): /design/live/#{live_link1.token}"
puts "Live Room Link 2 (Classic):    /design/live/#{live_link2.token}"
puts "Live Room Link 3 (Blank):      /design/live/#{live_link3.token}"
puts "View Links:"
puts "  View Link 1: /design/view/#{view_link1.token}"
puts "  View Link 2: /design/view/#{view_link2.token}"
puts "  View Link 3: /design/view/#{view_link3.token}"
puts "-" * 40
