import Navbar from "../../components/nav";
import BoardgameListPage from "../../admin/component/boardgame/boardgame";
import UsersListPage from "../component/user";
import RoomsListPage from "../component/room";
import TablesListPage from "../component/table"

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="w-screen h-[400px]">
        <img
          src="https://images.unsplash.com/photo-1585504198199-20277593b94f?q=80&w=1317&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="ภาพไม่โหลดวะน้อง"
          className="w-full h-full object-cover bg-black/30"
        />
      </div>
      <BoardgameListPage />
      <UsersListPage />
      <RoomsListPage />
      <TablesListPage />
    </>
  );
}
