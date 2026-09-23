import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    let redis;
    try {
        // 환경 변수 검증
        if (!process.env.UPSTASH_REDIS_REST_URL && !process.env.KV_REST_API_URL) {
            throw new Error("Redis 환경 변수(UPSTASH_REDIS_REST_URL 또는 KV_REST_API_URL)가 Vercel에 설정되지 않았습니다.");
        }
        redis = Redis.fromEnv();
    } catch (initError) {
        return res.status(500).json({ error: "초기화 실패: " + initError.message });
    }

    try {
        let items = await redis.get('compendium_items');
        if (!items) {
            items = [
                { id: 1, source: "우주 쇼핑몰", type: "물약", name: "포도맛 물약", price: "1,500 P", description: "사용 시 3 일간 성별이 바뀝니다." },
                { id: 2, source: "우주 쇼핑몰", type: "물약", name: "오렌지맛 물약", price: "1,500 P", description: "사용 시 3 일간 어린이 상태가 됩니다." }
            ];
            await redis.set('compendium_items', items);
        }

        if (req.method === 'GET') {
            return res.status(200).json(items);
        } 
        else if (req.method === 'POST') {
            const newItem = req.body;
            items.push(newItem);
            await redis.set('compendium_items', items);
            return res.status(200).json(items);
        } 
       else if (req.method === 'PUT') {
            const updatedItem = req.body;
            // 문자열/숫자 타입 차이로 인한 수정 누락 오류 해결
            items = items.map(item => String(item.id) === String(updatedItem.id) ? updatedItem : item);
            await redis.set('compendium_items', items);
            return res.status(200).json(items);
        }
      else if (req.method === 'DELETE') {
            const { id } = req.query;
            // 문자열/숫자 타입 차이로 인한 삭제 오류 방지
            items = items.filter(item => String(item.id) !== String(id));
            await redis.set('compendium_items', items);
            return res.status(200).json(items);
        } 
        else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        return res.status(500).json({ error: "Redis 통신 오류: " + error.message });
    }
}
