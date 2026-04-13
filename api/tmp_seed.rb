d = Design.first
d.elements.destroy_all
d.elements.create!([
  {label: 'Main Roof', kind: 'roof', group_key: 'roof', mask_url: 'mask_roof.png', sort_order: 1},
  {label: 'Front Windows', kind: 'window', group_key: 'windows', mask_url: 'mask_windows.png', sort_order: 1},
  {label: 'Exterior Trim', kind: 'trim', group_key: 'trim', mask_url: 'mask_trim.png', sort_order: 1}
])
puts 'Granular elements created'
