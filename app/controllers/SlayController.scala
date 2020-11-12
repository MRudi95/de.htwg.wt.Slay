package controllers

import javax.inject._
import play.api.mvc._
import de.htwg.se.slay.Slay
import de.htwg.se.slay.controller.controllerComponent.{BalanceEvent, CombineErrorEvent, Event, GamePieceErrorEvent, MoneyErrorEvent, MovableErrorEvent, MoveErrorEvent, MovedErrorEvent, OwnerErrorEvent, RedoErrorEvent, UndoErrorEvent}

@Singleton
class SlayController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
  val gameController = Slay.controller
  gameController.add(this)
  var message :String = _

  def slayAsText = {
    views.html.slay(this, message)
  }

  def about = Action {
    Ok(views.html.about())
  }

  def slay = Action {
    Ok(slayAsText)
  }

  //commands
  def buy(coord: String) = Action {
    Slay.tui.processInput("buy " + coord)
    Ok(slayAsText)
  }

  def mov(coord1: String, coord2: String) = Action{
    Slay.tui.processInput("mov " + coord1 + " " + coord2)
    Ok(slayAsText)
  }

  def cmb(coord1: String, coord2: String) = Action{
    Slay.tui.processInput("cmb " + coord1 + " " + coord2)
    Ok(slayAsText)
  }

  def plc(coord: String) = Action {
    Slay.tui.processInput("plc " + coord)
    Ok(slayAsText)
  }

  def undo() = Action {
    Slay.tui.processInput("undo")
    Ok(slayAsText)
  }

  def redo() = Action {
    Slay.tui.processInput("redo")
    Ok(slayAsText)
  }

  def end() = Action {
    Slay.tui.processInput("end")
    Ok(slayAsText)
  }

  def surrender() = Action {
    Slay.tui.processInput("ff20")
    Ok(slayAsText)
  }

  def command(command: String) = Action{
    Slay.tui.processInput(command)
    Ok(slayAsText)
  }


  def getPlayerturn() = {
    gameController.players(gameController.state).name
  }


  override def update(e: Event): Boolean = {
    e match{
      case _: MoneyErrorEvent =>
        message = "Not enough Money!"; true
      case b: BalanceEvent =>
        message = "Balance: " + b.bal + "\tIncome: " + b.inc + "\tArmyCost: " + b.cost; true
      case _: OwnerErrorEvent =>
        message = "You are not the Owner of this!"; true
      case _: GamePieceErrorEvent =>
        message = "There already is a GamePiece there!"; true
      case _: CombineErrorEvent =>
        message = "Can't combine those Units!"; true
      case m: MoveErrorEvent =>
        message = "Can't move there! " + m.reason; true
      case _: MovableErrorEvent =>
        message = "This Unit is not movable!"; true
      case _: MovedErrorEvent =>
        message = "This Unit has already moved this turn!"; true
      case _: UndoErrorEvent =>
        message = "Nothing to undo!"; true
      case _: RedoErrorEvent =>
        message = "Nothing to redo!"; true
      case _ => false
    }
  }
}


