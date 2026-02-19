const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.FIT,
    autocenter: Phaser.Scale.NO_CENTER,
    orientation: Phaser.Scale.LANDSCAPE,
    width: window.innerWidth,
    height: window.innerHeight,
  },

  parent: "game",

  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let player;

let cursors;

let player_parado_sur;
let player_parado_norte;
let player_parado_oeste;
let player_parado_este;
let vision_player = "sur";

let player_caminando_sur;
let player_caminando_norte;
let player_caminando_oeste;
let player_caminando_este;

let posicionesOcupadas = [];
let arboles;
let piedras;

let itemEnMano = "nada";

let inventario = [{ tipo: "hacha", cantidad: 1, icono:"hacha_1" }];
const inventarioStock = 5;
let slotSeleccionado = 0;
let iconosSlots = []
let textosCantidad = []

let ultimoGolpe = 0;

function actualizarIconosInventario(scene){
  for(let i=0; i<inventarioStock; i++){
    const slotIcon = iconosSlots[i]
    const texto = textosCantidad[i]
    const item = inventario[i]
    
    if(!item){
      slotIcon.setVisible(false)
      texto.setVisible(false)
      continue;
    }
    
    slotIcon.setTexture(item.icono);
    slotIcon.setVisible(true)
    
    texto.setText(item.cantidad)
    texto.setVisible(true)
  }
}

function guardarEnInventario(tipo, cantidad, icono) {
  let itemEnInventario = inventario.find((item) => item.tipo === tipo);

  if (itemEnInventario) {
    itemEnInventario.cantidad += cantidad;
    return;
  }
  if (inventario.length >= inventarioStock) return;

  if (!itemEnInventario) {
    inventario.push({
      tipo: tipo,
      cantidad: cantidad,
      icono: icono,
    });
  }
  
  actualizarIconosInventario(game.scene.keys.default)
}

function creacionArboles(scene) {
  for (let i = 0; i < 1900000; i++) {
    let x = Phaser.Math.Between(0, 10040);
    let y = Phaser.Math.Between(0, 10040);

    let valido = true;

    for (let p of posicionesOcupadas) {
      let dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
      if (dist < 100) {
        valido = false;
        break;
      }
    }

    if (valido) {
      posicionesOcupadas.push({ x, y });

      let arbol = scene.physics.add.staticSprite(x, y, "arbol");

      arbol.setOrigin(0.5, 1);
      arbol.setDepth(arbol.y);

      arboles.add(arbol);

      arbol.refreshBody();

      arbol.setSize(50, 10);
      arbol.setOffset(20, 133);

      return arbol;
    }
  }

  return null;
}

function creacionPiedras(scene) {
  for (let i = 0; i < 3500; i++) {
    let x = Phaser.Math.Between(0, 10040);
    let y = Phaser.Math.Between(0, 10040);

    let valido = true;

    for (let p of posicionesOcupadas) {
      let dist = Phaser.Math.Distance.Between(x, y, p.x, p.y);
      if (dist < 200) {
        valido = false;
        break;
      }
    }

    if (valido) {
      posicionesOcupadas.push({ x, y });

      let piedra = scene.physics.add.staticSprite(x, y, "icon_piedra");
      
      piedra.setDepth(piedra.y);

      piedras.add(piedra);

      piedra.refreshBody();
      
      piedra.setSize(6, 6);
      piedra.setOffset(10, 0);

      return piedra;
    }
  }

  return null;
}

function actualizarBarraEnergia() {
  if (this.energiaActual >= 0) {
    const porcentaje = this.energiaActual / this.energiaMax;

    this.barraEnergiaFondo.clear();
    this.barraEnergiaRelleno.clear();

    this.barraEnergiaFondo.fillStyle(0x000000, 0.5);
    this.barraEnergiaFondo.fillRect(20, 20, 200, 20);

    this.barraEnergiaRelleno.fillStyle(0x00ff00, 1);
    this.barraEnergiaRelleno.fillRect(20, 20, 200 * porcentaje, 20);
  }
}

function preload() {
  this.load.image("player_parado_sur", "imagenes/player_parado_sur.png");
  this.load.image("player_parado_norte", "imagenes/player_parado_norte.png");
  this.load.image("player_parado_oeste", "imagenes/player_parado_oeste.png");
  this.load.image("player_parado_este", "imagenes/player_parado_este.png");

  this.load.image("btn_panel_user", "imagenes/maleta.png");
  
  this.load.image("btn_up","imagenes/btn_up_image.png");
  this.load.image("btn_down","imagenes/btn_down_image.png");
  this.load.image("btn_left","imagenes/btn_left_image.png");
  this.load.image("btn_right","imagenes/btn_right_image.png");
  
  this.load.image("btn_hit", "imagenes/btn_hit_image.png");
  
  this.load.image("slot_image","imagenes/slot_image.png");
  
  this.load.image("icon_madera","imagenes/icon_madera.png");
  
  this.load.image("icon_piedra","imagenes/icon_piedra.png");
  
  this.load.image("hacha_1","imagenes/hacha_1.png");
  
  this.load.spritesheet(
    "player_caminando_sur",
    "imagenes/player_caminando_sur.png",
    {
      frameWidth: 16,
      frameHeight: 32,
    },
  );

  this.load.spritesheet(
    "player_caminando_norte",
    "imagenes/player_caminando_norte.png",
    {
      frameWidth: 16,
      frameHeight: 32,
    },
  );

  this.load.spritesheet(
    "player_caminando_oeste",
    "imagenes/player_caminando_oeste.png",
    {
      frameWidth: 16,
      frameHeight: 32,
    },
  );

  this.load.spritesheet(
    "player_caminando_este",
    "imagenes/player_caminando_este.png",
    {
      frameWidth: 16,
      frameHeight: 32,
    },
  );

  this.load.spritesheet("arbol_golpeado", "imagenes/Arbol_golpeado.png", {
    frameWidth: 80,
    frameHeight: 150,
  });

  this.load.spritesheet("arbol_cayendo", "imagenes/arbol_cayendo.png", {
    frameWidth: 202,
    frameHeight: 150,
  });

  this.load.image("arbol", "imagenes/arbol_tile.png");

  this.load.image("tile_suelo_bosque", "imagenes/tile_suelo_bosque.png");

  this.load.tilemapTiledJSON("mapa", "mapas/bosque_mapa.tmj");
}

function create() {
  const map = this.make.tilemap({ key: "mapa" });
  const tileset = map.addTilesetImage("tile_suelo_bosque", "tile_suelo_bosque");

  const capa = map.createLayer("Capa de patrones 1", tileset,0,0);

  cursors = this.input.keyboard.createCursorKeys();

  this.anims.create({
    key: "caminar_sur",
    frames: this.anims.generateFrameNumbers("player_caminando_sur", {
      start: 0,
      end: 1,
    }),
    frameRate: 6,
    repeat: -1,
  });

  this.anims.create({
    key: "caminar_norte",
    frames: this.anims.generateFrameNumbers("player_caminando_norte", {
      start: 0,
      end: 1,
    }),
    frameRate: 6,
    repeat: -1,
  });

  this.anims.create({
    key: "caminar_este",
    frames: this.anims.generateFrameNumbers("player_caminando_este", {
      start: 0,
      end: 3,
    }),
    frameRate: 6,
    repeat: -1,
  });

  this.anims.create({
    key: "caminar_oeste",
    frames: this.anims.generateFrameNumbers("player_caminando_oeste", {
      start: 0,
      end: 3,
    }),
    frameRate: 6,
    repeat: -1,
  });

  this.anims.create({
    key: "arbol_moviendose_golpe",
    frames: this.anims.generateFrameNumbers("arbol_golpeado", {
      start: 0,
      end: 3,
    }),
    frameRate: 6,
    repeat: 0,
  });

  this.anims.create({
    key: "arbol_cayendose_anim",
    frames: this.anims.generateFrameNumbers("arbol_cayendo", {
      start: 0,
      end: 8,
    }),
    frameRate: 6,
    repeat: 0,
  });

  player = this.physics.add.sprite(5000, 5000, "player_parado_sur");
  player.setOrigin(0.5, 1);
  player.setCollideWorldBounds(true);
  player.setSize(32, 16);

  arboles = this.physics.add.staticGroup();
  piedras = this.physics.add.staticGroup();

  this.cameras.main.setBounds(0, 0, 10040, 10040);
  this.physics.world.setBounds(0, 0, 10040, 10040);

  this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  this.cameras.main.startFollow(player, true, 0.1, 0.1);

  for (let i = 0; i < 1000; i++) {
    creacionArboles(this);
    creacionPiedras(this)
  }

  this.physics.add.collider(player, arboles);
  this.physics.add.collider(player, piedras);

  this.energiaMax = 100;
  this.energiaActual = 100;

  this.barraEnergiaFondo = this.add.graphics();
  this.barraEnergiaRelleno = this.add.graphics();

  this.barraEnergiaFondo.setDepth(9999);
  this.barraEnergiaRelleno.setDepth(9999);

  this.barraEnergiaFondo.fillStyle(0x000000, 0.5);
  this.barraEnergiaFondo.fillRect(20, 20, 200, 20);

  this.actualizarBarraEnergia = actualizarBarraEnergia;
  this.actualizarBarraEnergia();
  this.barraEnergiaFondo.setScrollFactor(0);
  this.barraEnergiaRelleno.setScrollFactor(0);

  this.guardarEnInventario = guardarEnInventario;
  
  this.btnInteractuar = this.add.image(695, 30 + 5 * 35, "btn_hit")
  .setScrollFactor(0)
  .setInteractive()
  .setScale(2)
  .setAlpha(0.7)
  .setDepth(10000)
  
  this.puedeInteractuar = true
  
  this.btnInteractuar.on("pointerdown", () => (this.btnInteractuarDown = true))
  this.btnInteractuar.on("pointerup", () => (this.btnInteractuarDown = false))

  this.puedeGolpear = true

  this.btnGolpear = this.add.image(650, 50 + 5 * 35, "btn_hit")
    .setScrollFactor(0)
    .setInteractive()
    .setScale(2)
    .setAlpha(0.7)
    .setDepth(10000)

  this.btnGolpear.on("pointerdown", () => (this.btnGolpearDown = true))
  this.btnGolpear.on("pointerup", () => (this.btnGolpearDown = false))
  

  //INVENTARIO
  this.btn_slot_1 = this.add
    .image(30, 50 + 1 * 35, "slot_image")
    .setScrollFactor(0)
    .setInteractive()
    .setScale(2)
    .setAlpha(0.4)
    .setDepth(9999);
  this.btn_slot_2 = this.add
    .image(30, 50 + 2 * 35, "slot_image")
    .setScrollFactor(0)
    .setInteractive()
    .setScale(2)
    .setAlpha(0.4)
    .setDepth(9999);
  this.btn_slot_3 = this.add
    .image(30, 50 + 3 * 35, "slot_image")
    .setScrollFactor(0)
    .setInteractive()
    .setScale(2)
    .setAlpha(0.4)  
    .setDepth(9999);
  this.btn_slot_4 = this.add
    .image(30, 50 + 4 * 35, "slot_image")
    .setScrollFactor(0)
    .setInteractive()
    .setScale(2)
    .setAlpha(0.4)
    .setDepth(9999);
  this.btn_slot_5 = this.add
    .image(30, 50 + 5 * 35, "slot_image")
    .setScrollFactor(0)
    .setInteractive()
    .setScale(2)
    .setAlpha(0.4)
    .setDepth(9999);
  
  //ICONOS EN INVENTARIO
  
  for(let i=0; i<inventarioStock;i++){
    let icon = this.add.image(30, 50 + (i+1) * 35, "slot_image")
    .setScrollFactor(0)
    .setVisible(false)
    .setDepth(10000);
    
    iconosSlots.push(icon)
  }
  
  for(let i=0; i<inventarioStock;i++){
    let txt = this.add.text(38, 48 + (i+1) * 35, "0", {
      fontSize: "10px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(10000).setVisible(false)
    
    textosCantidad.push(txt)
  }

  this.btn_slot_1.on("pointerdown", () => (slotSeleccionado = 0));

  this.btn_slot_2.on("pointerdown", () => (slotSeleccionado = 1));

  this.btn_slot_3.on("pointerdown", () => (slotSeleccionado = 2));

  this.btn_slot_4.on("pointerdown", () => (slotSeleccionado = 3));

  this.btn_slot_5.on("pointerdown", () => (slotSeleccionado = 4));

  this.input.keyboard.on("keydown-ONE", () => {
    slotSeleccionado = 0;

    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  });

  this.input.keyboard.on("keydown-TWO", () => {
    slotSeleccionado = 1;

    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  });

  this.input.keyboard.on("keydown-THREE", () => {
    slotSeleccionado = 2;

    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  });

  this.input.keyboard.on("keydown-FOUR", () => {
    slotSeleccionado = 3;

    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  });

  this.input.keyboard.on("keydown-FIVE", () => {
    slotSeleccionado = 4;

    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  });

  //botones para celular
  this.btnLeft = this.add
    .image(90, 200, "btn_left")
    .setInteractive()
    .setScale(2)
    .setAlpha(0.7)
    .setScrollFactor(0)
    .setDepth(10000)
  this.btnRight = this.add
    .image(150, 200, "btn_right")
    .setInteractive()
    .setScale(2)
    .setAlpha(0.7)
    .setDepth(10000)
    .setScrollFactor(0);
  this.btnUp = this.add
    .image(120, 165, "btn_up")
    .setInteractive()
    .setScale(2)
    .setAlpha(0.7)
    .setDepth(10000)
    .setScrollFactor(0);
  this.btnDown = this.add
    .image(120, 235, "btn_down")
    .setInteractive()
    .setScale(2)
    .setAlpha(0.7)
    .setDepth(10000)
    .setScrollFactor(0);

  this.btnLeft.setDepth(9999);
  this.btnRight.setDepth(9999);
  this.btnUp.setDepth(9999);
  this.btnDown.setDepth(9999);

  //Detección
  this.btnLeft.on("pointerdown", () => (this.leftPressed = true));
  this.btnLeft.on("pointerup", () => (this.leftPressed = false));

  this.btnRight.on("pointerdown", () => (this.rightPressed = true));
  this.btnRight.on("pointerup", () => (this.rightPressed = false));

  this.btnUp.on("pointerdown", () => (this.upPressed = true));
  this.btnUp.on("pointerup", () => (this.upPressed = false));

  this.btnDown.on("pointerdown", () => (this.downPressed = true));
  this.btnDown.on("pointerup", () => (this.downPressed = false));
  
  actualizarIconosInventario(game.scene.keys.default);
  
  this.teclas = this.input.keyboard.addKeys("W,D,S,A,F,Q,E")

  this.btn_panel_user = this.add.image(700, 105, "btn_panel_user").setInteractive().setAlpha(0.7).setDepth(9999).setScrollFactor(0).setScale(0.7)

  this.btn_panel_user.on("down", () => (this.panel_estado_visible = !this.panel_user.visible));
  this.input.keyboard.on("keydown-E", () => (this.panel_estado_visible = !this.panel_user.visible));

  this.panel_user = this.add.rectangle(0,0,window.innerWidth, innerHeight, 0x000000, 0.7).setOrigin(0).setDepth(10001).setScrollFactor(0).setVisible(false)  
  this.btn_salir_panel = this.add.image(window.innerWidth - 30, 30, "btn_salir_panel").setInteractive().setDepth(10002).setScrollFactor(0).setScale(2).setVisible(false)

  this.btn_salir_panel.on("down", () => (this.panel_estado_visible = false));
}

function update() {
  let moving = false;
  player.setVelocity(0);

  player.setDepth(player.y);

  if (this.teclas.A.isDown || this.leftPressed) {
    player.setVelocityX(-100);
    vision_player = "oeste";
    player.play("caminar_oeste", true);
    moving = true;
  } else if (this.teclas.D.isDown || this.rightPressed) {
    player.setVelocityX(100);
    vision_player = "este";
    player.play("caminar_este", true);
    moving = true;
  }else if (this.teclas.W.isDown || this.upPressed) {
    player.setVelocityY(-100);
    vision_player = "norte";
    player.play("caminar_norte", true);
    moving = true;
  } else if (this.teclas.S.isDown || this.downPressed) {
    player.setVelocityY(100);
    vision_player = "sur";
    player.play("caminar_sur", true);
    moving = true;
  }

  if (!moving) {
    switch (vision_player) {
      case "norte":
        player.setTexture("player_parado_norte");
        break;
      case "sur":
        player.setTexture("player_parado_sur");
        break;
      case "este":
        player.setTexture("player_parado_este");
        break;
      case "oeste":
        player.setTexture("player_parado_oeste");
        break;
    }

    player.anims.stop();
  }

  //INVENTARIO
  if(slotSeleccionado == 0){
    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  }
  if(slotSeleccionado == 1){
    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  }
  if(slotSeleccionado == 2){
    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  }
  if(slotSeleccionado == 3){
    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  }
  if(slotSeleccionado == 4){
    itemEnMano = inventario[slotSeleccionado]?.tipo || "nada";
  }

  //BOTON GOLPEAR
  if(this.btnGolpearDown || this.teclas.F.isDown){

    if(!this.puedeGolpear) return;

    this.puedeGolpear = false;

    this.time.delayedCall(900, () => {
      this.puedeGolpear = true
    })

    if (itemEnMano == "hacha") {
      arboles.children.iterate((arbol) => {
        if(!arbol) return;

        if (
          Phaser.Math.Distance.Between(player.x, player.y, arbol.x, arbol.y) <
          50
        ) {

          arbol.play("arbol_moviendose_golpe", true);

          this.energiaActual -= 1;
          this.actualizarBarraEnergia();

          if (arbol.vida == undefined) arbol.vida = 80;
          arbol.vida -= 10;

          

          if (arbol.vida <= 0) {
            arbol.play("arbol_cayendose_anim", true);
            arbol.setOrigin(0.5, 1);
            arbol.x += 61
            this.time.delayedCall(1600, () => {
              arbol.destroy();
              guardarEnInventario("madera", 5, "icon_madera");
              actualizarIconosInventario(game.scene.keys.default)
            });
          }
        }
      });
    }
  }
  
  if(this.btnInteractuarDown || this.teclas.Q.isDown){
    
    if(!this.puedeInteractuar) return;
    
    this.puedeInteractuar = false
    
    this.time.delayedCall(90, () => {
      this.puedeInteractuar = true
    });
    
    if(inventario.length > inventarioStock) return;
  
    piedras.children.iterate((piedra) => {
      
      if(!piedra) return;
      
      if (Phaser.Math.Distance.Between(player.x, player.y, piedra.x, piedra.y)<50) {

        this.energiaActual -= 1;
        this.actualizarBarraEnergia();
        
        piedra.destroy();

        this.guardarEnInventario("piedra", 1, "icon_piedra");
        actualizarIconosInventario(game.scene.keys.default)
      }
    });
  }

  if(this.panel_estado_visible){
    this.panel_user.setVisible(true)
    this.btn_salir_panel.setVisible(true)
  }else{
    this.panel_user.setVisible(false)
    this.btn_salir_panel.setVisible(false)
  }
}