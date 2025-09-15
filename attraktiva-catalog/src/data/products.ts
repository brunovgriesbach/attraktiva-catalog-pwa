export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  subcategory: string
}

export const sampleProducts: Product[] = [
  {
    id: 1,
    name: 'Cadeira Atenas',
    description: 'Cadeira de madeira com estofado macio e apoio ergonômico.',
    price: 100,
    image: 'https://via.placeholder.com/300x200.png?text=Cadeira+Atenas',
    category: 'Sala de Estar',
    subcategory: 'Cadeiras',
  },
  {
    id: 2,
    name: 'Sofá Melissa',
    description: 'Sofá de três lugares com tecido aveludado e pés em madeira.',
    price: 2000,
    image: 'https://via.placeholder.com/300x200.png?text=Sofa+Melissa',
    category: 'Sala de Estar',
    subcategory: 'Sofás',
  },
  {
    id: 3,
    name: 'Rack Aurora',
    description: 'Rack compacto com espaço para eletrônicos e acabamento amadeirado.',
    price: 450,
    image: 'https://via.placeholder.com/300x200.png?text=Rack+Aurora',
    category: 'Sala de Estar',
    subcategory: 'Racks',
  },
  {
    id: 4,
    name: 'Mesa de Jantar Tupia',
    description: 'Mesa de jantar retangular para seis pessoas com tampo laqueado.',
    price: 720,
    image: 'https://via.placeholder.com/300x200.png?text=Mesa+Tupia',
    category: 'Jantar',
    subcategory: 'Mesas',
  },
  {
    id: 5,
    name: 'Poltrona Karina',
    description: 'Poltrona reclinável com apoio para os pés e revestimento em linho.',
    price: 1200,
    image: 'https://via.placeholder.com/300x200.png?text=Poltrona+Karina',
    category: 'Sala de Estar',
    subcategory: 'Poltronas',
  },
  {
    id: 6,
    name: 'Cama Brisa',
    description: 'Cama casal com cabeceira estofada e baú embutido para armazenamento.',
    price: 1800,
    image: 'https://via.placeholder.com/300x200.png?text=Cama+Brisa',
    category: 'Quarto',
    subcategory: 'Camas',
  },
]
