import { kv } from '@vercel/kv';

const DEFAULT_ITEMS = [
    { id: 1, source: "우주 쇼핑몰", type: "물약", name: "포도맛 물약", price: "1,500 P", description: "사용 시 3 일간 성별이 바뀝니다." },
    { id: 2, source: "우주 쇼핑몰", type: "물약", name: "오렌맛 물약", price: "1,500 P", description: "사용 시 3 일간 어린이 상태가 됩니다." }
];

export default async function handler(req, res) {
    try {
        let items = await kv.get('compendium_items');
        if (!items) {
            items = DEFAULT_ITEMS;
            await kv.set('compendium_items', items);
        }

        if (req.method === 'GET') {
            return res.status(200).json(items);
        } 
        
        else if (req.method === 'POST') {
            const newItem = req.body;
            items.push(newItem);
            await kv.set('compendium_items', items);
            return res.status(200).json(items);
        } 
        
        else if (req.method === 'PUT') {
            const updatedItem = req.body;
            items = items.map(item => item.id === updatedItem.id ? updatedItem : item);
            await kv.set('compendium_items', items);
            return res.status(200).json(items);
        } 
        
        else if (req.method === 'DELETE') {
            const { id } = req.query;
            items = items.filter(item => item.id !== Number(id));
            await kv.set('compendium_items', items);
            return res.status(200).json(items);
        } 
        
        else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
