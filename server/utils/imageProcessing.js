
function base64ToBinary(base64String) {
    // 去除 Base64 字符串中的前缀部分（例如："data:image/jpeg;base64,"）
    const encodedData = base64String.split(',')[1];
    // 将 Base64 字符串解码为二进制数据
    const binaryData = Buffer.from(encodedData, 'base64');

    return binaryData;
}

function binaryToBase64(buffer) {
    // 将 Buffer 对象转换为 Base64 字符串
    const base64String = buffer.toString('base64');
    // 添加前缀，这是可选的，取决于您的需求
    const prefix = 'data:image/jpeg;base64,';  // 请根据实际需求修改
    const base64Data = prefix + base64String;
    return base64Data;
}

module.exports = {
    base64ToBinary,
    binaryToBase64
}