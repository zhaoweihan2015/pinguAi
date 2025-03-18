import { SmileFilled } from '@ant-design/icons';
import { Space } from 'antd';
export default function Welcome() {
    return (
        <Space direction="vertical" size={16} className="placeholder">
            <h1>使用说明</h1>
            <p>默认使用的是deepseek-r1，如果要修改性格和模型，在左下角<SmileFilled />点击即可</p>
            <p>是否开启联网功能只有deepseek有，不开启联网数据只到2023年，但是接口返回会非常快，联网后需要等待服务器返回，大约3到4秒</p>
            <p>function calling功能目前只有doubao可以用，倒霉的火山deepseek不支持流式响应的时候调用tool</p>
        </Space>
    )
}
