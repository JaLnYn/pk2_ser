function formatDate(d) {
    if (d == null){
        return null
    }
    var month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}


const dbToGQL_User = (user) => {
    return {...user, password: null, date_of_birth: formatDate(user.date_of_birth), registration_date: null}
}

const mergeUserAndProperty = (property, user) => {
    return {...property, landlord: {...dbToGQL_User(user)}}
}

const fav_formate_date = (fav) => {
    return {...fav, decision_date: formatDate(fav.decision_date), unmatched_date: formatDate(fav.unmatched_date)}
}

module.exports = {dbToGQL_User, mergeUserAndProperty, fav_formate_date}