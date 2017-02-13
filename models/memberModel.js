var mongoose = require('mongoose');

var memberSchema = mongoose.Schema({
    id: { type: Number, unique: true, required: true },
    ref: String,
    radioNum: Number,
    name: { type: String, unique: true, required: true },
    team_id: Number,
    position: String,
    email: String,
    address: String,
    homephone: String,
    mobilephone: String,
    workphone: String,
    pager: Number,
    on_call: Boolean,
    default_duty: String,
    duty_start: String,
    duty_end: String,
    duty_type: String,
    permission: {
      id: Number,
      name: String
    },
    status: {
      id: Number,
      name: String
    },
    emergency_contacts: [
      {
        name: String,
        relation: String,
        phone: String,
        alt_phone: String
      },
      {
        name: String,
        relation: String,
        phone: String,
        alt_phone: String
      }
    ],
    gender: String,
    eye_color: String,
    hair_color: String,
    height: String,
    weight: String,
    classification: String,
    rank: String,
    birthdate: String, 
    leave_of_absence: String


    // custom_fields: [
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: [
    //       {
    //         id: String,
    //         value: String
    //       }
    //     ],
    //     postfix: String,
    //     hint: String,
    //     bundle: String
    //   },
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: String,
    //     postfix: String,
    //     hint: String,
    //     bundle: String
    //   },
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: String,
    //     postfix: String,
    //     hint: String,
    //     bundle: String
    //   },
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: String,
    //     postfix: null,
    //     hint: String,
    //     bundle: String
    //   },
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: String,
    //     postfix: String,
    //     hint: String,
    //     bundle: String
    //   },
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: [
    //       {
    //         id: String,
    //         value: String
    //       }
    //     ],
    //     postfix: String,
    //     hint: String,
    //     bundle: String
    //   },
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: [
    //       {
    //         id: String,
    //         value: String
    //       }
    //     ],
    //     postfix: String,
    //     hint: String,
    //     bundle: String
    //   },
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: String,
    //     postfix: String,
    //     hint: String,
    //     bundle: String
    //   },
    //   {
    //     id: Number,
    //     entity_id: Number,
    //     secure: Boolean,
    //     type: String,
    //     label: String,
    //     value_string: String,
    //     value: String,
    //     postfix: String,
    //     hint: String,
    //     bundle: String
    //   }
    // ]
});

module.exports = mongoose.model('members', memberSchema)
