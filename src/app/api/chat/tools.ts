

export const getTimes = {
    description: '获取当前时间',
    typeName: 'getTimes',
    parameters: {},
    execute: async () => {
        console.log('执行了getTimes');
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        return `${hours}:${minutes}`;
    }
}