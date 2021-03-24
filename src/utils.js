function getCommitterAsanaTag(name) {
    if (!name) {
        return name;
    } else if (name === 'apgapg') {
        return 'https://app.asana.com/0/712057959076542/list';
    } else if (name === 'someshubham') {
        return 'https://app.asana.com/0/1127520825602495/list';
    } else if (name === 'samvitjain') {
        return 'https://app.asana.com/0/1190264423420113/list';
    } else {
        return name;
    }
}

module.exports.getCommitterAsanaTag = getCommitterAsanaTag;