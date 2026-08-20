extends Node2D

const FLOOR_Y := 574.0
const ARENA_SIZE := Vector2(1280, 720)
const CYLOPS_IDLE := "res://Sprites/Cyclops/01 [Default]/Idle_00.png"
const WOLVERINE_IDLE := "res://Sprites/Wolverine/04 [Blue]/Idle_00_10.png"

var game_mode := "cpu"
var selected_difficulty := "easy"
var match_active := false
var p1 := {"x": 350.0, "health": 120.0, "cooldown": 0.0, "facing": 1.0}
var p2 := {"x": 930.0, "health": 120.0, "cooldown": 0.0, "facing": -1.0}
var p1_sprite: Sprite2D
var p2_sprite: Sprite2D
var menu: Control
var status_label: Label

func _ready() -> void:
    get_viewport().size = ARENA_SIZE
    _build_menu()
    queue_redraw()

func _process(delta: float) -> void:
    if match_active:
        _update_match(delta)
        queue_redraw()

func _draw() -> void:
    draw_rect(Rect2(Vector2.ZERO, ARENA_SIZE), Color("10151b"))
    draw_rect(Rect2(0, 0, 1280, FLOOR_Y), Color("263942"))
    draw_rect(Rect2(0, FLOOR_Y, 1280, 146), Color("17252b"))
    for x in range(-600, 1900, 80):
        draw_line(Vector2(640, FLOOR_Y), Vector2(x, 720), Color(0.4, 0.88, 0.88, 0.18), 2.0)
    draw_line(Vector2(0, FLOOR_Y), Vector2(1280, FLOOR_Y), Color("f8c947"), 2.0)

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
    mode_title.text = "GAME MODE"
    mode_title.position = Vector2(82, 245)
    mode_title.add_theme_color_override("font_color", Color("f8c947"))
    menu.add_child(mode_title)

    var cpu_button := Button.new()
    cpu_button.text = "1V1 CPU"
    cpu_button.position = Vector2(80, 280)
    cpu_button.size = Vector2(220, 52)
    cpu_button.pressed.connect(_choose_cpu)
    menu.add_child(cpu_button)

    var online_button := Button.new()
    online_button.text = "1V1 ONLINE"
    online_button.position = Vector2(315, 280)
    online_button.size = Vector2(220, 52)
    online_button.pressed.connect(_choose_online)
    menu.add_child(online_button)

    status_label = Label.new()
    status_label.text = "CPU MODE // SELECT DIFFICULTY"
    status_label.position = Vector2(82, 365)
    status_label.add_theme_color_override("font_color", Color("b9c5c5"))
    menu.add_child(status_label)

    var start_button := Button.new()
    start_button.text = "START MATCH"
    start_button.position = Vector2(80, 450)
    start_button.size = Vector2(455, 62)
    start_button.pressed.connect(_start_match)
    menu.add_child(start_button)

func _choose_cpu() -> void:
    game_mode = "cpu"
    status_label.text = "CPU MODE // EASY // PRESS START MATCH"

func _choose_online() -> void:
    game_mode = "online"
    status_label.text = "ONLINE MODE // LOBBY NETWORK COMING NEXT"

func _start_match() -> void:
    if game_mode == "online":
        status_label.text = "ONLINE MODE REQUIRES A GODOT SERVER"
        return
    p1 = {"x": 350.0, "health": 120.0, "cooldown": 0.0, "facing": 1.0}
    p2 = {"x": 930.0, "health": 120.0, "cooldown": 0.0, "facing": -1.0}
    menu.visible = false
    _create_fighter_sprites()
    match_active = true

func _create_fighter_sprites() -> void:
    p1_sprite = Sprite2D.new()
    p1_sprite.texture = load(CYLOPS_IDLE)
    p1_sprite.position = Vector2(p1.x, FLOOR_Y - 112)
    p1_sprite.scale = Vector2(1.65, 1.65)
    add_child(p1_sprite)

    p2_sprite = Sprite2D.new()
    p2_sprite.texture = load(WOLVERINE_IDLE)
    p2_sprite.position = Vector2(p2.x, FLOOR_Y - 112)
    p2_sprite.scale = Vector2(-1.65, 1.65)
    add_child(p2_sprite)

func _update_match(delta: float) -> void:
    p1.cooldown = maxf(0.0, p1.cooldown - delta)
    p2.cooldown = maxf(0.0, p2.cooldown - delta)
    var direction := Input.get_axis("ui_left", "ui_right")
    p1.x = clampf(p1.x + direction * 260.0 * delta, 90.0, 1190.0)
    if Input.is_action_just_pressed("ui_accept") and p1.cooldown <= 0.0:
        p1.cooldown = 0.45
        if absf(p2.x - p1.x) < 180.0:
            p2.health = maxf(0.0, p2.health - 6.0)
    var distance := p1.x - p2.x
    if absf(distance) > 190.0:
        p2.x += signf(distance) * 75.0 * delta
    elif p2.cooldown <= 0.0:
        p2.cooldown = 1.2
        p1.health = maxf(0.0, p1.health - 4.0)
    p1_sprite.position.x = p1.x
    p2_sprite.position.x = p2.x
    if p1.health <= 0.0 or p2.health <= 0.0:
        match_active = false
        menu.visible = true
        status_label.text = "ROUND OVER // PRESS START MATCH"
        p1_sprite.queue_free()
        p2_sprite.queue_free()
