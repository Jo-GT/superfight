extends Node2D

const FLOOR_Y := 574.0
const ARENA_SIZE := Vector2(1280, 720)
const CYCLOPS_FOLDER := "res://Sprites/Cyclops/01 [Default]/"
const WOLVERINE_FOLDER := "res://Sprites/Wolverine/04 [Blue]/"
const CYCLOPS_PROJECTILES := "res://Sprites/Cyclops/"
const MENU_MUSIC := "res://Music/xmenmain.mp3"
const FIGHT_MUSIC := "res://Music/BGM.mp3"

var game_mode := "cpu"
var selected_difficulty := "easy"
var selected_kind := "cyclops"
var selected_costume := "default"
var sound_enabled := true
var match_active := false
var p1_x := 350.0
var p1_health := 120.0
var p1_cooldown := 0.0
var p1_action_time := 0.0
var p1_action := "idle"
var p1_y := FLOOR_Y
var p1_vy := 0.0
var p1_invulnerable := 0.0
var p2_x := 930.0
var p2_health := 120.0
var p2_cooldown := 0.0
var p2_action_time := 0.0
var p2_action := "idle"
var p1_meter := 0.0
var p2_meter := 0.0
var attack_pressed := false
var power_pressed := false
var special_pressed := false
var jump_pressed := false
var dodge_pressed := false
var projectile_x := -1.0
var projectile_direction := 1.0
var projectile_active := false
var projectile_sprite: AnimatedSprite2D
var p1_sprite: AnimatedSprite2D
var p2_sprite: AnimatedSprite2D
var menu: Control
var hud: Control
var status_label: Label
var p1_health_bar: ColorRect
var p2_health_bar: ColorRect
var p1_meter_bar: ColorRect
var p2_meter_bar: ColorRect
var combo_label: Label
var music: AudioStreamPlayer
var costume_select: OptionButton
var character_status: Label
var animation_cache := {}
var projectile_frames: SpriteFrames

func _ready() -> void:
	get_viewport().size = ARENA_SIZE
	projectile_frames = _build_projectile_frames()
	_warm_fighter_assets()
	_build_audio()
	_build_menu()
	_build_hud()
	queue_redraw()

func _warm_fighter_assets() -> void:
	animation_cache[CYCLOPS_FOLDER] = _build_fighter_frames(CYCLOPS_FOLDER)
	animation_cache[WOLVERINE_FOLDER] = _build_fighter_frames(WOLVERINE_FOLDER)

func _process(delta: float) -> void:
	if match_active:
		_update_match(delta)
		_update_hud()
		queue_redraw()
	attack_pressed = false
	power_pressed = false
	special_pressed = false
	jump_pressed = false
	dodge_pressed = false

func _unhandled_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	if event.keycode == KEY_X:
		attack_pressed = true
	elif event.keycode == KEY_A:
		power_pressed = true
	elif event.keycode == KEY_S:
		special_pressed = true
	elif event.keycode == KEY_W or event.keycode == KEY_UP:
		jump_pressed = true
	elif event.keycode == KEY_DOWN:
		dodge_pressed = true
	elif event.keycode == KEY_ESCAPE and match_active:
		match_active = false
		menu.visible = true
		hud.visible = false
		music.stop()
		music.stream = load(MENU_MUSIC)
		music.play()

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, ARENA_SIZE), Color("10151b"))
	draw_rect(Rect2(0, 0, 1280, FLOOR_Y), Color("263942"))
	draw_rect(Rect2(0, FLOOR_Y, 1280, 146), Color("17252b"))
	for x in range(-600, 1900, 80):
		draw_line(Vector2(640, FLOOR_Y), Vector2(x, 720), Color(0.4, 0.88, 0.88, 0.18), 2.0)
	draw_line(Vector2(0, FLOOR_Y), Vector2(1280, FLOOR_Y), Color("f8c947"), 2.0)

func _build_audio() -> void:
	music = AudioStreamPlayer.new()
	music.stream = load(MENU_MUSIC)
	music.volume_db = -6.0
	add_child(music)
	music.play()

func _build_hud() -> void:
	hud = Control.new()
	hud.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hud.visible = false
	add_child(hud)
	var p1_name := Label.new()
	p1_name.text = "CYCLOPS"
	p1_name.position = Vector2(40, 28)
	p1_name.add_theme_font_size_override("font_size", 24)
	hud.add_child(p1_name)
	var p2_name := Label.new()
	p2_name.text = "WOLVERINE"
	p2_name.position = Vector2(1050, 28)
	p2_name.add_theme_font_size_override("font_size", 24)
	hud.add_child(p2_name)
	p1_health_bar = ColorRect.new()
	p1_health_bar.position = Vector2(40, 65)
	p1_health_bar.size = Vector2(480, 18)
	p1_health_bar.color = Color("67e1e0")
	hud.add_child(p1_health_bar)
	p2_health_bar = ColorRect.new()
	p2_health_bar.position = Vector2(760, 65)
	p2_health_bar.size = Vector2(480, 18)
	p2_health_bar.color = Color("e84d39")
	hud.add_child(p2_health_bar)
	p1_meter_bar = ColorRect.new()
	p1_meter_bar.position = Vector2(40, 92)
	p1_meter_bar.size = Vector2(480, 8)
	p1_meter_bar.color = Color("f8c947")
	hud.add_child(p1_meter_bar)
	p2_meter_bar = ColorRect.new()
	p2_meter_bar.position = Vector2(760, 92)
	p2_meter_bar.size = Vector2(480, 8)
	p2_meter_bar.color = Color("f8c947")
	hud.add_child(p2_meter_bar)
	combo_label = Label.new()
	combo_label.text = "COMBO POWER 0 / 3"
	combo_label.position = Vector2(540, 32)
	combo_label.add_theme_font_size_override("font_size", 16)
	hud.add_child(combo_label)

func _update_hud() -> void:
	if not hud:
		return
	p1_health_bar.size.x = 480.0 * p1_health / 120.0
	p2_health_bar.size.x = 480.0 * p2_health / 120.0
	p1_meter_bar.size.x = 480.0 * p1_meter / 3.0
	p2_meter_bar.size.x = 480.0 * p2_meter / 3.0
	combo_label.text = "COMBO POWER %d / 3" % int(p1_meter)

func _build_menu() -> void:
	menu = Control.new()
	menu.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	menu.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(menu)

	var panel := ColorRect.new()
	panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	panel.color = Color("f211181e")
	panel.modulate = Color(1, 1, 1, 0.96)
	menu.add_child(panel)

	var title := Label.new()
	title.text = "SUPERFIGHT\nCLASH PROTOCOL"
	title.position = Vector2(80, 75)
	title.add_theme_font_size_override("font_size", 54)
	menu.add_child(title)

	var mode_title := Label.new()
	mode_title.text = "FIGHTER"
	mode_title.position = Vector2(82, 245)
	mode_title.add_theme_color_override("font_color", Color("f8c947"))
	menu.add_child(mode_title)
	var cyclops_button := Button.new()
	cyclops_button.text = "CYCLOPS"
	cyclops_button.position = Vector2(80, 280)
	cyclops_button.size = Vector2(220, 52)
	cyclops_button.pressed.connect(_choose_cyclops)
	menu.add_child(cyclops_button)
	var wolverine_button := Button.new()
	wolverine_button.text = "WOLVERINE"
	wolverine_button.position = Vector2(315, 280)
	wolverine_button.size = Vector2(220, 52)
	wolverine_button.pressed.connect(_choose_wolverine)
	menu.add_child(wolverine_button)
	var costume_label := Label.new()
	costume_label.text = "COSTUME"
	costume_label.position = Vector2(82, 355)
	menu.add_child(costume_label)
	costume_select = OptionButton.new()
	costume_select.position = Vector2(80, 380)
	costume_select.size = Vector2(455, 42)
	costume_select.item_selected.connect(_choose_costume)
	menu.add_child(costume_select)
	_populate_costumes()

	var mode_label := Label.new()
	mode_label.text = "MODE / CPU DIFFICULTY"
	mode_label.position = Vector2(82, 445)
	menu.add_child(mode_label)
	var cpu_button := Button.new()
	cpu_button.text = "1V1 CPU"
	cpu_button.position = Vector2(80, 475)
	cpu_button.size = Vector2(145, 42)
	cpu_button.pressed.connect(_choose_cpu)
	menu.add_child(cpu_button)

	var online_button := Button.new()
	online_button.text = "1V1 ONLINE"
	online_button.position = Vector2(235, 475)
	online_button.size = Vector2(145, 42)
	online_button.pressed.connect(_choose_online)
	menu.add_child(online_button)
	var difficulty_button := Button.new()
	difficulty_button.text = "EASY"
	difficulty_button.position = Vector2(390, 475)
	difficulty_button.size = Vector2(145, 42)
	difficulty_button.pressed.connect(_cycle_difficulty)
	menu.add_child(difficulty_button)

	status_label = Label.new()
	status_label.text = "CPU MODE // EASY // PRESS START MATCH"
	status_label.position = Vector2(82, 545)
	status_label.add_theme_color_override("font_color", Color("b9c5c5"))
	menu.add_child(status_label)
	character_status = Label.new()
	character_status.text = "CYCLOPS // DEFAULT"
	character_status.position = Vector2(820, 480)
	character_status.add_theme_font_size_override("font_size", 24)
	menu.add_child(character_status)
	var sound_button := Button.new()
	sound_button.text = "SOUND ON"
	sound_button.position = Vector2(820, 535)
	sound_button.size = Vector2(180, 42)
	sound_button.pressed.connect(_toggle_sound)
	menu.add_child(sound_button)

	var start_button := Button.new()
	start_button.text = "START MATCH"
	start_button.position = Vector2(80, 600)
	start_button.size = Vector2(455, 62)
	start_button.pressed.connect(_start_match)
	menu.add_child(start_button)

func _choose_cpu() -> void:
	game_mode = "cpu"
	_update_menu_status()

func _choose_online() -> void:
	game_mode = "online"
	_update_menu_status()

func _choose_cyclops() -> void:
	selected_kind = "cyclops"
	selected_costume = "default"
	_populate_costumes()
	_warm_selected_fighter()
	_update_menu_status()

func _choose_wolverine() -> void:
	selected_kind = "wolverine"
	selected_costume = "blue"
	_populate_costumes()
	_warm_selected_fighter()
	_update_menu_status()

func _populate_costumes() -> void:
	if not costume_select:
		return
	costume_select.clear()
	var costumes := ["default", "red", "cable"] if selected_kind == "cyclops" else ["blue", "classic", "stealth"]
	for costume in costumes:
		costume_select.add_item(costume.to_upper())
	costume_select.select(0)
	if character_status:
		character_status.text = "%s // %s" % [selected_kind.to_upper(), selected_costume.to_upper()]

func _choose_costume(index: int) -> void:
	var costumes := ["default", "red", "cable"] if selected_kind == "cyclops" else ["blue", "classic", "stealth"]
	selected_costume = costumes[index]
	_warm_selected_fighter()
	character_status.text = "%s // %s" % [selected_kind.to_upper(), selected_costume.to_upper()]

func _warm_selected_fighter() -> void:
	var folder := _selected_folder()
	if not animation_cache.has(folder):
		animation_cache[folder] = _build_fighter_frames(folder)

func _cycle_difficulty() -> void:
	var difficulties := ["easy", "normal", "hard"]
	selected_difficulty = difficulties[(difficulties.find(selected_difficulty) + 1) % difficulties.size()]
	_update_menu_status()

func _update_menu_status() -> void:
	status_label.text = "%s MODE // %s // PRESS START MATCH" % [game_mode.to_upper(), selected_difficulty.to_upper()]

func _toggle_sound() -> void:
	sound_enabled = not sound_enabled
	music.stream_paused = not sound_enabled

func _start_match() -> void:
	if game_mode == "online":
		status_label.text = "ONLINE MODE REQUIRES A GODOT SERVER"
		return
	p1_x = 350.0
	p1_health = 120.0
	p1_cooldown = 0.0
	p1_action_time = 0.0
	p1_action = "idle"
	p1_y = FLOOR_Y
	p1_vy = 0.0
	p1_invulnerable = 0.0
	p1_meter = 0.0
	p2_x = 930.0
	p2_health = 120.0
	p2_cooldown = 0.0
	p2_action_time = 0.0
	p2_action = "idle"
	p2_meter = 0.0
	projectile_active = false
	menu.visible = false
	hud.visible = true
	music.stop()
	music.stream = load(FIGHT_MUSIC)
	if sound_enabled:
		music.play()
	_create_fighter_sprites()
	match_active = true

func _create_fighter_sprites() -> void:
	var player_folder := _selected_folder()
	var opponent_folder := WOLVERINE_FOLDER if selected_kind == "cyclops" else CYCLOPS_FOLDER
	p1_sprite = _create_animated_fighter(player_folder)
	p1_sprite.position = Vector2(p1_x, FLOOR_Y - 112)
	p1_sprite.scale = Vector2(1.65, 1.65)
	add_child(p1_sprite)

	p2_sprite = _create_animated_fighter(opponent_folder)
	p2_sprite.position = Vector2(p2_x, FLOOR_Y - 112)
	p2_sprite.scale = Vector2(-1.65, 1.65)
	add_child(p2_sprite)

func _selected_folder() -> String:
	if selected_kind == "cyclops":
		var cyclops_costumes := {"default": "01 [Default]", "red": "03 [Red]", "cable": "07 [Cable '97]"}
		return "res://Sprites/Cyclops/%s/" % cyclops_costumes[selected_costume]
	var wolverine_costumes := {"blue": "04 [Blue]", "classic": "06 [Classic]", "stealth": "08 [Stealth]"}
	return "res://Sprites/Wolverine/%s/" % wolverine_costumes[selected_costume]

func _create_animated_fighter(folder: String) -> AnimatedSprite2D:
	var sprite := AnimatedSprite2D.new()
	var frames: SpriteFrames = animation_cache.get(folder)
	if frames == null:
		frames = _build_fighter_frames(folder)
		animation_cache[folder] = frames
	sprite.sprite_frames = frames
	sprite.animation = "idle"
	sprite.play()
	return sprite

func _build_fighter_frames(folder: String) -> SpriteFrames:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	_add_animation(frames, "idle", folder, "Idle_")
	_add_animation(frames, "walk", folder, "Walk_")
	_add_animation(frames, "attack", folder, "Attack1_")
	_add_animation(frames, "jump", folder, "Jump_")
	_add_animation(frames, "air_attack", folder, "Attackair")
	_add_animation(frames, "rising_attack", folder, "Attackrising")
	_add_animation(frames, "sprint_attack", folder, "Attacksprinting")
	_add_animation(frames, "power", folder, "Power")
	_add_animation(frames, "air_power", folder, "Powerair")
	_add_animation(frames, "special", folder, "Special")
	_add_animation(frames, "dodge", folder, "Dodge_")
	_add_animation(frames, "hit", folder, "Hitstun_")
	return frames

func _create_projectile() -> AnimatedSprite2D:
	var sprite := AnimatedSprite2D.new()
	sprite.sprite_frames = projectile_frames
	sprite.animation = "power"
	sprite.scale = Vector2(0.9, 0.9)
	add_child(sprite)
	return sprite

func _build_projectile_frames() -> SpriteFrames:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	_add_animation(frames, "power", CYCLOPS_PROJECTILES, "Powerprojectil")
	_add_animation(frames, "special", CYCLOPS_PROJECTILES, "Specialprojectile_")
	return frames

func _add_animation(frames: SpriteFrames, animation_name: String, folder: String, prefix: String) -> void:
	var directory := DirAccess.open(folder)
	if directory == null:
		return
	var filenames: Array[String] = []
	directory.list_dir_begin()
	var filename := directory.get_next()
	while filename != "":
		if not directory.current_is_dir() and filename.begins_with(prefix) and filename.ends_with(".png"):
			filenames.append(filename)
		filename = directory.get_next()
	directory.list_dir_end()
	filenames.sort()
	if filenames.is_empty():
		return
	frames.add_animation(animation_name)
	frames.set_animation_speed(animation_name, 10.0)
	frames.set_animation_loop(animation_name, true)
	for frame_name in filenames:
		frames.add_frame(animation_name, load(folder + frame_name))

func _update_match(delta: float) -> void:
	p1_cooldown = maxf(0.0, p1_cooldown - delta)
	p2_cooldown = maxf(0.0, p2_cooldown - delta)
	p1_action_time = maxf(0.0, p1_action_time - delta)
	p2_action_time = maxf(0.0, p2_action_time - delta)
	p1_invulnerable = maxf(0.0, p1_invulnerable - delta)
	var direction := Input.get_axis("ui_left", "ui_right")
	p1_x = clampf(p1_x + direction * 260.0 * delta, 90.0, 1190.0)
	if jump_pressed and is_zero_approx(p1_y - FLOOR_Y):
		p1_vy = -620.0
		p1_action = "jump"
		p1_action_time = 0.35
	if dodge_pressed and is_zero_approx(p1_y - FLOOR_Y) and p1_cooldown <= 0.0:
		p1_cooldown = 0.35
		p1_invulnerable = 0.35
		p1_action = "dodge"
		p1_action_time = 0.4
		p1_x = clampf(p1_x + (1.0 if direction >= 0.0 else -1.0) * 80.0, 90.0, 1190.0)
	p1_vy += 1500.0 * delta
	p1_y = minf(FLOOR_Y, p1_y + p1_vy * delta)
	if is_zero_approx(p1_y - FLOOR_Y):
		p1_vy = 0.0
	if p1_action_time > 0.0:
		p1_sprite.play(p1_action)
	elif direction != 0.0:
		p1_sprite.play("walk")
	else:
		p1_sprite.play("idle")
	if attack_pressed and p1_cooldown <= 0.0:
		p1_cooldown = 0.45
		p1_action = "air_attack" if not is_zero_approx(p1_y - FLOOR_Y) else ("rising_attack" if jump_pressed else "attack")
		p1_action_time = 0.65
		p1_sprite.play(p1_action)
		if absf(p2_x - p1_x) < 180.0:
			p2_health = maxf(0.0, p2_health - 6.0)
			p1_meter = minf(3.0, p1_meter + 0.35)
	if power_pressed and p1_meter >= 1.0 and not projectile_active:
		p1_meter -= 1.0
		p1_action = "air_power" if not is_zero_approx(p1_y - FLOOR_Y) and p1_sprite.sprite_frames.has_animation("air_power") else "power"
		p1_action_time = 0.8
		_start_projectile("power")
	if special_pressed and p1_meter >= 3.0 and not projectile_active:
		p1_meter = 0.0
		p1_action = "special"
		p1_action_time = 1.2
		_start_projectile("special")
	_update_projectile(delta)
	var distance := p1_x - p2_x
	if absf(distance) > 190.0:
		p2_x += signf(distance) * 75.0 * delta
		if p2_action_time <= 0.0:
			p2_sprite.play("walk")
	elif p2_cooldown <= 0.0:
		p2_cooldown = 1.2
		p2_action = "attack"
		p2_action_time = 0.8
		if p1_invulnerable <= 0.0:
			p1_health = maxf(0.0, p1_health - 4.0)
		p2_meter = minf(3.0, p2_meter + 0.35)
		p2_sprite.play("attack")
	elif p2_action_time > 0.0:
		p2_sprite.play(p2_action)
	else:
		p2_sprite.play("idle")
	p1_sprite.position = Vector2(p1_x, p1_y - 112.0)
	p2_sprite.position.x = p2_x
	if p1_health <= 0.0 or p2_health <= 0.0:
		match_active = false
		menu.visible = true
		hud.visible = false
		music.stop()
		music.stream = load(MENU_MUSIC)
		music.play()
		status_label.text = "ROUND OVER // PRESS START MATCH"
		p1_sprite.queue_free()
		p2_sprite.queue_free()

func _start_projectile(projectile_type: String) -> void:
	projectile_active = true
	projectile_x = p1_x + 120.0
	projectile_direction = 1.0
	if not projectile_sprite:
		projectile_sprite = _create_projectile()
	projectile_sprite.animation = projectile_type
	projectile_sprite.play(projectile_type)
	projectile_sprite.visible = true

func _update_projectile(delta: float) -> void:
	if not projectile_active or not projectile_sprite:
		return
	projectile_x += projectile_direction * 520.0 * delta
	projectile_sprite.position = Vector2(projectile_x, FLOOR_Y - 150.0)
	if absf(p2_x - projectile_x) < 75.0:
		p2_health = maxf(0.0, p2_health - (24.0 if projectile_sprite.animation == "special" else 12.0))
		projectile_active = false
		projectile_sprite.visible = false
	if projectile_x > 1400.0:
		projectile_active = false
		projectile_sprite.visible = false
