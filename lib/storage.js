var Neon = require('neon'),
	FileSystem = require('fs'),
	path = require('path');

Module('Storage')({
	__path: {
		sessions: "../storage/sessions",
		users: "../storage/users"
	}, 
	db: {
		select: function (db, id) {
			try {
				var filePath = path.join(__dirname, Storage.__path[db], id);
				return JSON.parse(FileSystem.readFileSync(filePath, "utf8"))
			} catch (error) {
				console.log(error);
				return false;
			}
		},
		create: function (db, data) {
			var id, filePath;

			if (db == "users") {
				id = data.email
			} else if (db == "sessions") {
				id = data.id
			}

			filePath = path.join(__dirname, Storage.__path[db], id);
			data = JSON.stringify(data)
			FileSystem.writeFileSync(filePath, data)
			return Storage;
		},
		update: function (db, id, data) {
			var fileData;
			fileData = Storage.db.select(db, id);
			Storage.db.delete(db, id);
			for (key in fileData) {
				fileData[key] = data[key];
			}
			Storage.db.create(db, id, fileData);
			return Storage;
		}, 

		delete: function (db, id) {
			var filePath;
			filePath = path.join(__dirname, Storage.__path[db], id);
			FileSystem.unlinkSync(filePath);
			return Storage;
		}
	}
});

module.exports = Storage;