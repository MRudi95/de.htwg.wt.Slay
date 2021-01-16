package controllers

import javax.inject._
import play.api.mvc._
import de.htwg.se.slay.SlayModule
import de.htwg.se.slay.controller.controllerComponent._
import de.htwg.se.slay.model.fileIOComponent.fileIoJSONimpl.FileIO
import de.htwg.se.slay.util.Observer
import play.api.libs.json.Json
import play.api.libs.streams.ActorFlow
import akka.actor._
import akka.stream.Materializer
import com.google.inject.{Guice, Injector}

@Singleton
class SlayController @Inject()(cc: ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc){
  val jsonIO = new FileIO
  val injector: Injector = Guice.createInjector(new SlayModule)

  val gameController = newGameInstance() //wird spaeter liste mit allen laufenden spielen

  def newGameInstance():ControllerInterface = {
    val controller: ControllerInterface = injector.getInstance(classOf[ControllerInterface])

    controller.createGrid("Map1")
    controller.nextturn()

    controller
  }


  //wird noch wegrationalisiert durch gekapseltes frontend
  def about = Action {
    Ok(views.html.about())
  }

  def slay = Action {
    Ok(views.html.slay(this, ""))
  }
  // /wird noch wegrationalisiert

  //commands
  def buy(coord: String) = Action {
    processInput("buy " + coord, gameController)
    Ok("")
  }

  def mov(coord1: String, coord2: String) = Action{
    processInput("mov " + coord1 + " " + coord2, gameController)
    Ok("")
  }

  def cmb(coord1: String, coord2: String) = Action{
    processInput("cmb " + coord1 + " " + coord2, gameController)
    Ok("")
  }

  def plc(coord: String) = Action {
    processInput("plc " + coord, gameController)
    Ok("")
  }

  def bal(coord: String) = Action {
    processInput("bal " + coord, gameController)
    Ok("")
  }

  def undo() = Action {
    processInput("undo", gameController)
    Ok("")
    //brauch noch javascript wie die anderen
  }

  def redo() = Action {
    processInput("redo", gameController)
    Ok("")
    //brauch noch javascript wie die anderen
  }

  def end() = Action {
    processInput("end", gameController)
    Ok("")
  }

  def surrender() = Action {
    processInput("ff20", gameController)
    Ok("")
  }

  def getJson() = Action{
    var json = jsonIO.gridToJson(gameController.grid, gameController.players)
    json = json.+(("player", Json.obj(
      "playername" -> getPlayerturn(),
      "playercolor" -> getPlayercolor(),
    )))
    Ok(json)
  }

  def getPlayerturn() = {
    gameController.players(gameController.state).name
  }
  def getPlayercolor()={
    gameController.state match {
      case 1 => "yellow"
      case 2 => "green"
      case _ => ""
    }
  }


  //websocket
  def socket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      MyWebSocketActor.props(out)
    }
  }

  object MyWebSocketActor {
    def props(out: ActorRef) = {
      Props(new MyWebSocketActor(out))
    }
  }

  class MyWebSocketActor(out: ActorRef) extends Actor with Observer {
    gameController.add(this)

    def receive = {
      case msg: String =>
        out ! ("I received your message: " + msg)
    }

    val jsonIO = new FileIO
    override def update(e: Event): Boolean = {
      e match{
        case _: SuccessEvent => out ! jsonIO.gridToJson(gameController.grid, gameController.players).toString(); true
        case _: MoneyErrorEvent => out ! Json.obj( "message" -> "Not enough Money!").toString(); true
        case b: BalanceEvent =>
          val msg = "Balance: " + b.bal + " Income: " + b.inc + " ArmyCost: " + b.cost
          out ! Json.obj( "message" -> msg).toString(); true
        case _: OwnerErrorEvent => out ! Json.obj( "message" -> "You are not the Owner of this!").toString(); true
        case _: GamePieceErrorEvent => out ! Json.obj( "message" -> "There already is a GamePiece there!").toString(); true
        case _: CombineErrorEvent => out ! Json.obj( "message" -> "Can't combine those Units!").toString(); true
        case m: MoveErrorEvent =>
          val msg = "Can't move there! " + m.reason
          out ! Json.obj( "message" -> msg).toString(); true
        case _: MovableErrorEvent => out ! Json.obj( "message" -> "This Unit is not movable!").toString(); true
        case _: MovedErrorEvent => out ! Json.obj( "message" -> "This Unit has already moved this turn!").toString(); true
        case _: UndoErrorEvent => out ! Json.obj( "message" -> "Nothing to undo!").toString(); true
        case _: RedoErrorEvent => out ! Json.obj( "message" -> "Nothing to redo!").toString(); true
        case _: PlayerEvent =>
          out ! Json.obj("player" -> Json.obj(
          "playername" -> getPlayerturn(),
          "playercolor" -> getPlayercolor(),
          )).toString(); true
        case _ => false
      }
    }
  }

  //taken from TextUI
  def processInput(input: String, controller: ControllerInterface): Unit = {
    val coord = "[A-Z]\\d+".r
    val bal = s"bal ($coord)".r
    val buy = s"buy ($coord)".r
    val plc = s"plc ($coord)".r
    val mov = s"mov ($coord) ($coord)".r
    val cmb = s"cmb ($coord) ($coord)".r

    input match {
      case "q" =>
      case "quit" =>
      case "undo" => controller.undo()
      case "redo" => controller.redo()
      case "end" => controller.nextturn()
      case "ff20" => controller.surrender()
      case bal(c) if checkIndex(c) =>
        controller.seeBalance(convertIndex(c))
      case buy(c) if checkIndex(c) =>
        controller.buyPeasant(convertIndex(c))
      case plc(c) if checkIndex(c) =>
        controller.placeCastle(convertIndex(c))
      case mov(c1, c2) if checkIndex(c1) && checkIndex(c2) =>
        controller.moveUnit(convertIndex(c1), convertIndex(c2))
      case cmb(c1, c2) if checkIndex(c1) && checkIndex(c2) =>
        controller.combineUnit(convertIndex(c1), convertIndex(c2))
      case _ => println("Wrong Input!")
    }

    //helper functions
    def checkIndex(idx: String): Boolean ={
      val coord = "([A-Z])(\\d+)".r
      val coord(cols, rows) = idx
      val col = cols.charAt(0).toInt - 65
      if(col > controller.grid.colIdx || rows.toInt - 1 > controller.grid.rowIdx) false else true
    }
    def convertIndex(idx: String): Int ={
      val cols = idx.charAt(0).toInt - 65
      val rows = idx.charAt(1).asDigit - 1
      rows * (controller.grid.colIdx+1) + cols
    }
  }
}


