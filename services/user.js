
const User = require('../models/index').getModel('user')

const user = {
    /**
     * @Description: µÇÂ¼
     * @date 2019/5/30
     * @params: { Object } userData
     * @return: { Object | null }
     */
    async login (userData) {
        let result = await User.findOne(userData)
        console.log(result)
        return result
    }
}

module.exports = user
