class VisitedStore {
    save (visitedBoard) {
        const data = this.get().filter((board) => {
            return board.identifier !== visitedBoard.identifier;
        });

        data.push(visitedBoard);
        window.localStorage.setItem("visited", JSON.stringify(data));

        return data;
    }

    get () {
        let data = window.localStorage.getItem("visited");
        if (!data) { data = "[]"; }

        try {
            return JSON.parse(data);
        } catch (e) {
            window.localStorage.removeItem("visited");
            return [];
        }
    }
}

export default new VisitedStore();
