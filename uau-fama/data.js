/*
  PARA ADICIONAR UM ITEM:
  1. Duplique um objeto abaixo.
  2. Troque id, thumbnail, src/videoUrl, título, descrição e tags.
  3. Salve o arquivo. A galeria é atualizada automaticamente.

  Para vídeos MP4, use videoUrl: "videos/meu-video.mp4".
  Para YouTube/Vimeo, cole o link público em videoUrl.
*/
window.GALLERY_SETTINGS = {
  autoShuffle: true,        // troca automática ligada
  shuffleInterval: 7000,   // uma nova onda começa a cada 7 segundos
  shuffleCount: 3,         // quantidade de cartões trocados em cada onda
  shuffleStagger: 4000,    // intervalo de 4 segundos entre os cartões da mesma onda
  infiniteScroll: true,     // acrescenta uma nova composição ao chegar ao fim
  sheetUrl: "https://script.google.com/macros/s/AKfycbxc7EMmvH-Uhp6WXIigCBCj6uK2_AzuiUcV2PlE7J_NSElsHTBu4MsmA5vPgRQ8F10i/exec" // aplicativo web do Google Sheets
};

window.GALLERY_ITEMS = [
  {
    id: "silencio-azul",
    tipo: "image",
    thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=90",
    titulo: "Silêncio Azul",
    descricao: "Um estudo sobre horizonte, escala e os intervalos tranquilos entre uma paisagem e outra.",
    tags: ["paisagem", "fotografia"],
    destaque: true
  },
  {
    id: "materia-viva",
    tipo: "image",
    thumbnail: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=85",
    src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1600&q=90",
    titulo: "Matéria Viva",
    descricao: "Texturas botânicas observadas como pequenos sistemas gráficos em transformação.",
    tags: ["natureza", "detalhe"],
    destaque: false
  },
  {
    id: "entre-formas",
    tipo: "image",
    thumbnail: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=900&q=85",
    src: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1800&q=90",
    titulo: "Entre Formas",
    descricao: "Cor, gesto e sobreposição compõem uma paisagem abstrata de ritmo lento.",
    tags: ["arte", "cor"],
    destaque: true
  },
  {
    id: "cidade-em-camadas",
    tipo: "image",
    thumbnail: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=85",
    src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1800&q=90",
    titulo: "Cidade em Camadas",
    descricao: "Arquitetura, sombra e repetição formando uma narrativa geométrica do cotidiano.",
    tags: ["arquitetura", "cidade"],
    destaque: false
  },
  {
    id: "movimento-01",
    tipo: "video",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=85",
    videoUrl: "https://www.youtube.com/watch?v=ScMzIvxBSi4",
    titulo: "Movimento 01",
    descricao: "Um pequeno ensaio audiovisual sobre memória, luz e deslocamento.",
    tags: ["vídeo", "experimental"],
    destaque: true
  },
  {
    id: "corpo-luz",
    tipo: "image",
    thumbnail: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=85",
    src: "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1600&q=90",
    titulo: "Corpo Luz",
    descricao: "Presença e movimento atravessados pela luz de palco.",
    tags: ["performance", "fotografia"],
    destaque: false
  },
  {
    id: "superficie",
    tipo: "image",
    thumbnail: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=900&q=85",
    src: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=1800&q=90",
    titulo: "Superfície",
    descricao: "Uma investigação visual sobre imperfeições, pigmento e passagem do tempo.",
    tags: ["arte", "textura"],
    destaque: false
  },
  {
    id: "intervalo",
    tipo: "image",
    thumbnail: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=900&q=85",
    src: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=1800&q=90",
    titulo: "Intervalo",
    descricao: "Um recorte urbano onde o vazio também participa da composição.",
    tags: ["cidade", "arquitetura"],
    destaque: false
  }
];
