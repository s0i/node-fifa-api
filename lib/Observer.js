var Observer = (function() {
    function IPCollection() {
        return [];
    }

    function User(ip) {
        var time = new Date();
        time = time.toTimeString();

        return {
            ip: ip,
            time: time
        }
    }

    return {
        User: User,
        IPCollection: IPCollection
    }
}());

exports = module.exports = Observer;