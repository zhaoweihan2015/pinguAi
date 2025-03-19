import { SmileFilled } from '@ant-design/icons';
import { Space } from 'antd';
export default function Welcome() {
    return (
        <Space direction="vertical" size={16} className="placeholder">
            <h1>使用说明</h1>
            <p>默认使用的是deepseek-r1，如果要修改性格和模型，在左下角<SmileFilled />点击即可</p>
            <p>是否开启联网功能只有deepseek有，不开启联网数据只到2023年，但是接口返回会非常快，联网后需要等待服务器返回，大约3到4秒</p>
            <p style={{ textDecoration: 'line-through' }}>function calling功能目前只有doubao可以用，倒霉的火山引擎的deepseek不支持流式响应的时候调用tool</p>
            <p>测试过了，居然deepseek也能用，很神奇，虽然文档上写着不支持，但是依旧可以用</p>
            <p>可用工具：</p>
            <p>getBilibiliHotSearch：获取B站实时热搜榜单</p>
            <p>getMoYuTime：获取摸鱼日历</p>
        </Space>
    )
}
