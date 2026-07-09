// 这是运行在 Vercel 服务器上的代码，密钥写在这里是安全的
export default async function handler(req, res) {
    // 1. 允许跨域（防止浏览器报错）
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // 2. 只处理 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: '只支持 POST 请求' });
    }

    try {
        // 3. 从请求体中获取用户发来的消息
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ error: '消息不能为空' });
        }

        // 4. 从 Vercel 环境变量中读取密钥（安全！）
        const API_KEY = process.env.API_KEY;
        if (!API_KEY) {
            return res.status(500).json({ error: '服务器未配置 API Key' });
        }

        // 5. 调用 DeepSeek 官方 API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-v4-flash',
                messages: [{ role: 'user', content: message }]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'DeepSeek 接口报错');
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        // 6. 把回复内容返回给网页
        return res.status(200).json({ reply: reply });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}